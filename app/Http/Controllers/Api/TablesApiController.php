<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\Bica\BicaResource;
use App\Http\Resources\Client\ClientResource;
use App\Http\Resources\CommentResource;
use App\Http\Resources\ContractResource;
use App\Http\Resources\CostCenterResource;
use App\Http\Resources\Driver\DriverResource;
use App\Http\Resources\ItemResource;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\Timeline\TimelineEntryResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\Vehicles\VehicleResource;
use App\Models\Bica;
use App\Models\BusinessUnit;
use App\Models\Client;
use App\Models\Contract;
use App\Models\CostCenter;
use App\Models\Driver;
use App\Models\Item;
use App\Models\Order;
use App\Models\Project;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\WaitlistRegistration;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use App\Services\ActivityLogService;
use App\Services\CommentService;
use App\Services\TimelineService;
use App\Services\UploadService;
use App\Supports\TheOneResponse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TablesApiController extends Controller
{
    protected $limit, $order, $search, $sort, $filters, $request;

    protected const CACHE_TTL = 10; // seconds

    public function __construct(
        Request $request,
        #private readonly TimelineService $timelineService,
        #private readonly UploadService $uploadService
    ) {
        #$sortBy = $request->get('sort', 'name');
        #$sortOrder = $request->get('order', 'asc');

        $this->limit = $request->input('per_page') ?? $request->input('pageSize') ?? 30;
        $this->order = $request->input('order', null);
        $this->search = $request->input('search') ?? '';
        $this->filters = $request->input('filters') ?? [];
        $this->sort = $request->input('sort', null);
        $this->request = $request;
    }

    protected function cacheResponse(string $endpoint, callable $callback)
    {
        if (app()->isLocal()) {
            return $callback();
        }

        $cacheKey = $this->generateCacheKey($endpoint);

        return Cache::remember($cacheKey, self::CACHE_TTL, $callback);
    }

    protected function generateCacheKey(string $endpoint): string
    {
        $params = [
            'endpoint' => $endpoint,
            'query' => $this->request->all(),
            'user_id' => Auth::id(),
        ];

        return 'api:tables:' . md5(json_encode($params));
    }

    protected $tableMap = [
        'users' => [
            'model' => User::class,
            'resource' => UserResource::class,
            #'sort_by' => 'id',
            #'order_by' => 'asc',
        ],
    ];

    public function timeline()
    {
        $perPage = (int) $this->request->input('per_page', 20);
        $perPage = max(5, min($perPage, 50));

        $result = $this->timelineService->list(
            $this->request->string('subject_type')->toString(),
            $this->request->input('subject_id'),
            $perPage,
            $this->request->input('cursor')
        );

        return TimelineEntryResource::collection($result['items'])
            ->additional([
                'meta' => [
                    'next_cursor' => $result['next_cursor'],
                ],
            ]);
    }

    /**
     * Display a listing of the specified resource.
     * @param string $tableName
     */
    public function index(string $tableName)
    {
        // 1. Validate if the requested table exists in the map
        if (!array_key_exists($tableName, $this->tableMap)) {
            return response()->json(['error' => 'Table not found.'], 404);
        }

        return $this->cacheResponse("index:{$tableName}", function () use ($tableName) {
            $config = $this->tableMap[$tableName];
            $model = new $config['model'];

            // 2. Build the query dynamically
            $query = $model::query();

            // Apply custom scope if defined (e.g., for filtering by user)
            if (!empty($config['scope'])) {
                $scopeMethod = $config['scope'];
                if (method_exists($model, 'scope' . ucfirst($scopeMethod))) {
                    $query->$scopeMethod();
                }
            }

            // Eager load relationships if any are defined
            if (!empty($config['with'])) {
                $query->with($config['with']);
            }

            // Eager load relationships if any are defined
            if (!empty($config['withCount'])) {
                $query->withCount($config['withCount']);
            }

            if (method_exists($model, 'scopeFiltered')) {
                if ($tableName === 'purchase-requisitions') {
                    $query->filtered($this->request->except('order', 'sort', 'pageSize', 'page', 'per_page', 'status'));
                } else {
                    $query->filtered($this->request->except('order', 'sort', 'pageSize', 'page', 'per_page'));
                }
            }

            // Apply search functionality
            #if (!empty($this->search)) {
            #    $this->applySearch($query, $tableName, $this->search);
            #}

            // Apply filters
            if (!empty($this->filters)) {
                foreach ($this->filters as $column => $value) {
                    if ($value !== null && $value !== '') {
                        $query->where($column, $value);
                    }
                }
            }

            // Apply date range filters (e.g., created_at_from, created_at_to)
            $dateRangeFilters = collect($this->request->all())
                ->filter(function ($value, $key) {
                    return (str_ends_with($key, '_from') || str_ends_with($key, '_to')) && !empty($value);
                });

            foreach ($dateRangeFilters as $key => $value) {
                if (str_ends_with($key, '_from')) {
                    $column = str_replace('_from', '', $key);
                    $query->whereDate($column, '>=', $value);
                } elseif (str_ends_with($key, '_to')) {
                    $column = str_replace('_to', '', $key);
                    $query->whereDate($column, '<=', $value);
                }
            }

            if ($tableName === 'clients' && !empty($this->search)) {
                $search = $this->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('uuid', 'like', "%{$search}%")
                        ->orWhereHas('organization', function ($organization) use ($search) {
                            $organization->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Special case for items with type filter
            if ($tableName === 'items' && request()->has('type')) {
                $type = request()->get('type');
                $validTypes = ['stock', 'service', 'rental'];
                if (in_array($type, $validTypes)) {
                    $query->where('type', $type);
                }
            }

            if ($tableName === 'items' && request()->has('is_fixed_asset')) {
                $query->where('is_fixed_asset', true);
            }

            if ($tableName === 'items' && request()->has('is_stock_item')) {
                $query->where('is_stock_item', true);
            }

            if ($tableName === 'purchase-requisitions' && request()->has('category')) {
                $type = request()->get('category');
                $query->where('category_type', $type);
            }

            if ($tableName === 'purchase-requisitions' && (request()->has('status'))) {
                $status = request()->input('status');
                if ($status === 'pending') {
                    $query->where('quotation_status', 'pending');
                    $query->where('status', 'approved');
                } else {
                    $query->where('status', $status);
                }
            }

            // Filtro por item_id nas requisições de compra
            if ($tableName === 'purchase-requisitions' && request()->has('item_id')) {
                $itemId = request()->get('item_id');
                if ($itemId) {
                    $query->whereHas('items', function ($q) use ($itemId) {
                        $q->where('item_id', $itemId);
                    });
                }
            }

            #if ($tableName === 'purchase-requisitions' && request()->has('user_id')) {
            #    $user = request()->has('user_id');
            #    $query->whereHas('requisitor', function ($q) use ($user) {
            #        $q->where('id', $user);
            #    });
            #}

            // Special case for business-units with branch_id filter
            if ($tableName === 'business-units' && request()->has('branch_id')) {
                $branchId = request()->get('branch_id');
                if ($branchId) {
                    $query->whereHas('branches', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }
            }

            #if ($tableName === 'purchase-orders' && request()->has('user_uuid')) {
            #    $user = request()->get('user_uuid');
            #    if ($user) {
            #        $query->whereHas('requisitor', function ($q) use ($user) {
            #            $q->where('uuid', $user);
            #        });
            #    }
            #}

            $sortColumn = empty($this->sort)
                ? (!empty($config['sort_by']) ? $config['sort_by'] : null)
                : $this->sort;

            $sortDirection = empty($this->order)
                ? (!empty($config['order_by']) ? $config['order_by'] : 'asc') // default asc
                : $this->order;

            // Caso especial: se for tabela suppliers e coluna cpf_cnpj_formatted
            if ($tableName === 'suppliers' && $sortColumn === 'cpf_cnpj_formatted') {
                $sortColumn = 'cpf_cnpj';
            }

            if ($sortColumn) {
                $query->orderBy($sortColumn, $sortDirection);
            }

            $results = ($this->limit === 'all')
                ? $query->get()
                : $query->paginate($this->limit)->appends([
                    'sort'    => $sortColumn,
                    'order'   => $sortDirection,
                    'search'  => $this->search,
                    'filters' => $this->filters,
                ]);

            // 4. Use the correct Resource class to transform the data
            $resourceClass = $config['resource'];

            return $resourceClass::collection($results);
        });
    }


    public function dashboardPayments(Request $request)
    {
        [$period, $startDate, $endDate] = $this->resolveDashboardDateRange($request);

        $baseQuery = Payment::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('status')) {
            $baseQuery->where('status', $request->string('status')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $baseQuery->where(function ($query) use ($search) {
                $query->where('uuid', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $totalPayments = (clone $baseQuery)->count();
        $paidPaymentsQuery = (clone $baseQuery)->where('status', PaymentStatus::PAID->value);
        $paidPaymentsCount = (clone $paidPaymentsQuery)->count();
        $paidRevenueCents = (clone $paidPaymentsQuery)->sum('amount_cents');
        $walletAppliedCents = (clone $baseQuery)->sum('wallet_applied_cents');
        $gatewayAmountCents = (clone $baseQuery)->sum('gateway_amount_cents');
        $pendingPaymentsCount = (clone $baseQuery)->whereIn('status', [
            PaymentStatus::DRAFT->value,
            PaymentStatus::PENDING->value,
            PaymentStatus::REQUIRES_ACTION->value,
        ])->count();
        $failedPaymentsCount = (clone $baseQuery)->where('status', PaymentStatus::FAILED->value)->count();

        $statusBreakdown = (clone $baseQuery)
            ->select('status', DB::raw('COUNT(*) as total'), DB::raw('COALESCE(SUM(amount_cents), 0) as amount_cents'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        $dailyRevenue = (clone $baseQuery)
            ->selectRaw("
                DATE(created_at) as date,
                COUNT(*) as payments_count,
                COALESCE(SUM(CASE WHEN status = ? THEN amount_cents ELSE 0 END), 0) as paid_revenue_cents
            ", [PaymentStatus::PAID->value])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min($perPage, 50));

        $payments = (clone $baseQuery)
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'summary' => [
                'total_payments' => $totalPayments,
                'paid_payments' => $paidPaymentsCount,
                'pending_payments' => $pendingPaymentsCount,
                'failed_payments' => $failedPaymentsCount,
                'paid_revenue_cents' => (int) $paidRevenueCents,
                'wallet_applied_cents' => (int) $walletAppliedCents,
                'gateway_amount_cents' => (int) $gatewayAmountCents,
                'average_ticket_cents' => $paidPaymentsCount > 0 ? (int) round($paidRevenueCents / $paidPaymentsCount) : 0,
                'paid_conversion_rate' => $totalPayments > 0 ? round(($paidPaymentsCount / $totalPayments) * 100, 2) : 0,
                'status_breakdown' => $statusBreakdown->map(fn ($item) => [
                    'status' => $item->status,
                    'total' => (int) $item->total,
                    'amount_cents' => (int) $item->amount_cents,
                ]),
            ],
            'series' => $dailyRevenue->map(fn ($item) => [
                'date' => $item->date,
                'payments_count' => (int) $item->payments_count,
                'paid_revenue_cents' => (int) $item->paid_revenue_cents,
            ]),
            'table' => [
                'data' => collect($payments->items())->map(fn (Payment $payment) => [
                    'id' => $payment->id,
                    'uuid' => $payment->uuid,
                    'user_name' => $payment->user?->name,
                    'user_email' => $payment->user?->email,
                    'status' => $payment->status?->value ?? (string) $payment->status,
                    'payment_method' => $payment->payment_method?->value ?? (string) $payment->payment_method,
                    'gateway' => $payment->gateway,
                    'amount_cents' => (int) $payment->amount_cents,
                    'gateway_amount_cents' => (int) ($payment->gateway_amount_cents ?? 0),
                    'wallet_applied_cents' => (int) ($payment->wallet_applied_cents ?? 0),
                    'due_date' => optional($payment->due_date)->toDateString(),
                    'paid_at' => optional($payment->paid_at)->toDateString(),
                    'created_at' => optional($payment->created_at)->toDateTimeString(),
                ]),
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ],
            ],
        ]);
    }

    public function dashboardWaitlist(Request $request)
    {
        [$period, $startDate, $endDate] = $this->resolveDashboardDateRange($request);

        $baseQuery = WaitlistRegistration::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $baseQuery->where(function ($query) use ($search) {
                $query->where('stage_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%")
                    ->orWhere('city_state', 'like', "%{$search}%");
            });
        }

        if ($request->filled('creation_availability')) {
            $baseQuery->where('creation_availability', $request->string('creation_availability')->toString());
        }

        $totalRegistrations = (clone $baseQuery)->count();
        $uniqueEmails = (clone $baseQuery)->distinct('contact_email')->count('contact_email');
        $registrationsToday = (clone $baseQuery)->whereDate('created_at', Carbon::today())->count();

        $availabilityBreakdown = (clone $baseQuery)
            ->select('creation_availability', DB::raw('COUNT(*) as total'))
            ->groupBy('creation_availability')
            ->orderBy('creation_availability')
            ->get();

        $dailyRegistrations = (clone $baseQuery)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as registrations_count')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(5, min($perPage, 50));

        $registrations = (clone $baseQuery)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'summary' => [
                'total_registrations' => $totalRegistrations,
                'unique_emails' => $uniqueEmails,
                'registrations_today' => $registrationsToday,
                'availability_breakdown' => $availabilityBreakdown->map(fn ($item) => [
                    'creation_availability' => $item->creation_availability,
                    'total' => (int) $item->total,
                ]),
            ],
            'series' => $dailyRegistrations->map(fn ($item) => [
                'date' => $item->date,
                'registrations_count' => (int) $item->registrations_count,
            ]),
            'table' => [
                'data' => collect($registrations->items())->map(fn (WaitlistRegistration $registration) => [
                    'id' => $registration->id,
                    'stage_name' => $registration->stage_name,
                    'contact_email' => $registration->contact_email,
                    'city_state' => $registration->city_state,
                    'creation_availability' => $registration->creation_availability,
                    'artist_types' => $registration->artist_types ?? [],
                    'participation_types' => $registration->participation_types ?? [],
                    'created_at' => optional($registration->created_at)->toDateTimeString(),
                ]),
                'meta' => [
                    'current_page' => $registrations->currentPage(),
                    'last_page' => $registrations->lastPage(),
                    'per_page' => $registrations->perPage(),
                    'total' => $registrations->total(),
                ],
            ],
        ]);
    }

    private function resolveDashboardDateRange(Request $request): array
    {
        $period = $request->string('period')->toString() ?: 'month';
        $now = Carbon::now();

        if ($period === 'day') {
            $startDate = $now->copy()->startOfDay();
            $endDate = $now->copy()->endOfDay();
        } elseif ($period === 'week') {
            $startDate = $now->copy()->startOfWeek(Carbon::MONDAY);
            $endDate = $now->copy()->endOfWeek(Carbon::SUNDAY);
        } elseif ($period === 'custom') {
            $startDate = $request->filled('start_date')
                ? Carbon::parse($request->string('start_date')->toString())->startOfDay()
                : $now->copy()->startOfMonth();
            $endDate = $request->filled('end_date')
                ? Carbon::parse($request->string('end_date')->toString())->endOfDay()
                : $now->copy()->endOfDay();
        } else {
            $period = 'month';
            $startDate = $now->copy()->startOfMonth();
            $endDate = $now->copy()->endOfMonth();
        }

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate->copy()->startOfDay(), $startDate->copy()->endOfDay()];
        }

        return [$period, $startDate, $endDate];
    }

    /**
     * Normalize string for comparison (remove accents, lowercase, normalize spaces)
     */
    private function normalizeString(string $str): string
    {
        // Convert to lowercase
        $str = mb_strtolower($str, 'UTF-8');

        // Remove accents
        $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);

        // Replace hyphens and underscores with spaces
        $str = str_replace(['-', '_'], ' ', $str);

        // Normalize multiple spaces
        $str = preg_replace('/\s+/', ' ', $str);

        return trim($str);
    }

    /**
     * Apply search functionality based on table type
     */
    private function applySearch($query, string $tableName, string $search)
    {
        switch ($tableName) {
            case 'items':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
                break;

            case 'inventories':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
                break;

            case 'purchase-requisitions':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
                break;

            case 'suppliers':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
                break;

            case 'users':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
                break;

            case 'cost-centers':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
                break;

            case 'business-units':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
                break;

            case 'branches':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
                break;

            case 'organizations':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
                break;

            case 'assets':
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('tag', 'like', "%{$search}%");
                });
                break;

            default:
                // Generic search for name field
                if (method_exists($query->getModel(), 'getTable')) {
                    $table = $query->getModel()->getTable();
                    $columns = \Schema::getColumnListing($table);

                    if (in_array('name', $columns)) {
                        $query->where('name', 'like', "%{$search}%");
                    }
                }
                break;
        }
    }
}
