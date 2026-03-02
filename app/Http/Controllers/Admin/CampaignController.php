<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    /**
     * Allowed columns for dynamic sorting.
     */
    private const SORTABLE_COLUMNS = [
        'name',
        'status',
        'created_at',
        'slots_to_approve',
        'price_per_influencer',
    ];

    /**
     * Display the campaigns listing page with filters, sorting and pagination.
     * Shows only campaigns from UNDER_REVIEW onwards (excludes DRAFT, PENDING, AWAITING_PAYMENT)
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $statuses = $request->input('statuses', []);
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $perPage = $request->integer('per_page', 15);

        // Sanitize sort parameters
        if (! in_array($sortBy, self::SORTABLE_COLUMNS, true)) {
            $sortBy = 'created_at';
        }

        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($perPage, 5), 100);

        // Admin-visible statuses (UNDER_REVIEW onwards)
        $adminStatuses = [
            CampaignStatus::UNDER_REVIEW,
            CampaignStatus::APPROVED,
            CampaignStatus::REFUSED,
            CampaignStatus::SENT_TO_CREATORS,
            CampaignStatus::IN_PROGRESS,
            CampaignStatus::COMPLETED,
            CampaignStatus::CANCELLED,
        ];

        $query = Campaign::query()
            ->with(['user:id,name,email,avatar'])
            ->withCount('approvedCreators')
            ->whereIn('status', array_map(fn($s) => $s->value, $adminStatuses));

        // Apply search scope
        if ($search) {
            $query->search($search);
        }

        // Apply status filter (only if within allowed statuses)
        if (! empty($statuses)) {
            $statusEnums = collect($statuses)
                ->map(fn (string $value) => CampaignStatus::tryFrom($value))
                ->filter(fn($s) => in_array($s, $adminStatuses, true))
                ->all();

            if (! empty($statusEnums)) {
                $query->byStatus($statusEnums);
            }
        }

        // Apply date range filter
        if ($dateFrom && $dateTo) {
            $query->whereBetween('created_at', [$dateFrom, $dateTo]);
        } elseif ($dateFrom) {
            $query->where('created_at', '>=', $dateFrom);
        } elseif ($dateTo) {
            $query->where('created_at', '<=', $dateTo);
        }

        // Apply sorting and pagination
        $query->orderBy($sortBy, $sortDir);

        $campaigns = CampaignResource::collection(
            $query->paginate($perPage)->withQueryString()
        );

        return Inertia::render('admin/campaigns/index', [
            'campaigns' => $campaigns,
            'filters' => [
                'search' => $search,
                'statuses' => $statuses,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'statusOptions' => collect($adminStatuses)
                ->map(fn (CampaignStatus $s) => [
                    'value' => $s->value,
                    'label' => $s->getLabelText(),
                    'color' => $s->getLabelColor(),
                ])
                ->values(),
        ]);
    }

    /**
     * Display the campaign detail page.
     */
    public function show(Campaign $campaign): Response
    {
        $campaign->load([
            'user:id,name,email,avatar',
            'reviewer:id,name,email',
            'approvedCreators:id,name,email,avatar,account_type',
        ]);

        return Inertia::render('admin/campaigns/show', [
            'campaign' => new CampaignResource($campaign),
        ]);
    }
}
