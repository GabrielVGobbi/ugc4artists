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
            'user_id' => auth()->id(),
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
