<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

/**
 * Service to handle generic model listing with filters, search, sorting, and pagination
 *
 * @example
 * $service = new ModelListService($request);
 * $results = $service->list(User::class, [
 *     'searchable' => ['name', 'email'],
 *     'filterable' => ['account_type', 'document'],
 *     'with' => ['onboardingProfile'],
 * ]);
 */
class ModelListService
{
    protected const CACHE_TTL = 10; // seconds

    public function __construct(
        protected Request $request
    ) {}

    /**
     * List models with filters, search, sorting, and pagination
     *
     * @param string $modelClass The model class to query
     * @param array $config Configuration options:
     *   - searchable: array of searchable columns
     *   - filterable: array of filterable columns (supports dot notation for relations)
     *   - sortable: array of sortable columns
     *   - with: array of relationships to eager load
     *   - withCount: array of relationships to count
     *   - scopes: array of scope methods to apply
     *   - defaultSort: default sort column
     *   - defaultDirection: default sort direction (asc|desc)
     *   - perPage: items per page (default: 30)
     *   - cache: enable cache (default: false)
     *   - customFilters: callable to apply custom filters
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function list(string $modelClass, array $config = [])
    {
        $config = array_merge($this->getDefaultConfig(), $config);

        if ($config['cache'] && !app()->isLocal()) {
            return $this->cacheResponse($modelClass, fn() => $this->buildQuery($modelClass, $config));
        }

        return $this->buildQuery($modelClass, $config);
    }

    /**
     * Build the query with all filters, search, and sorting applied
     */
    protected function buildQuery(string $modelClass, array $config)
    {
        /** @var Model $model */
        $model = new $modelClass;
        $query = $model::query();

        // Apply eager loading
        if (!empty($config['with'])) {
            $query->with($config['with']);
        }

        if (!empty($config['withCount'])) {
            $query->withCount($config['withCount']);
        }

        // Apply scopes
        $this->applyScopes($query, $config['scopes']);

        // Apply search
        if ($this->request->filled('search') && !empty($config['searchable'])) {
            $this->applySearch($query, $config['searchable'], $this->request->string('search')->toString());
        }

        // Apply filterable columns
        if (!empty($config['filterable'])) {
            $this->applyFilters($query, $config['filterable']);
        }

        // Apply date range filters
        $this->applyDateRangeFilters($query);

        // Apply custom filters callback
        if (isset($config['customFilters']) && is_callable($config['customFilters'])) {
            $config['customFilters']($query, $this->request);
        }

        // Apply model's scopeFiltered if exists
        if (method_exists($model, 'scopeFiltered')) {
            $query->filtered($this->request->except('order', 'sort', 'sort_by', 'sort_direction', 'pageSize', 'page', 'per_page', 'search'));
        }

        // Apply sorting
        $this->applySorting($query, $config);

        // Paginate or get all
        $perPage = $this->request->input('per_page') ?? $this->request->input('pageSize') ?? $config['perPage'];

        if ($perPage === 'all') {
            return $query->get();
        }

        return $query->paginate((int) $perPage)->appends($this->request->except('page'));
    }

    /**
     * Apply scopes to query
     */
    protected function applyScopes(Builder $query, array $scopes): void
    {
        foreach ($scopes as $scope => $params) {
            if (is_numeric($scope)) {
                // Scope without params: ['myScope']
                $scopeName = $params;
                $query->$scopeName();
            } else {
                // Scope with params: ['myScope' => ['param1', 'param2']]
                $query->$scope(...(is_array($params) ? $params : [$params]));
            }
        }
    }

    /**
     * Apply search to query
     */
    protected function applySearch(Builder $query, array $searchable, string $search): void
    {
        $query->where(function (Builder $q) use ($searchable, $search) {
            foreach ($searchable as $column) {
                // Support for relationship search: 'relation.column'
                if (str_contains($column, '.')) {
                    [$relation, $relationColumn] = explode('.', $column, 2);
                    $q->orWhereHas($relation, function (Builder $relationQuery) use ($relationColumn, $search) {
                        $relationQuery->where($relationColumn, 'like', "%{$search}%");
                    });
                } else {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            }
        });
    }

    /**
     * Apply filters to query
     */
    protected function applyFilters(Builder $query, array $filterable): void
    {
        foreach ($filterable as $column) {
            $value = $this->request->input($column);

            if ($value === null || $value === '') {
                continue;
            }

            // Handle relationship filters: 'relation.column'
            if (str_contains($column, '.')) {
                [$relation, $relationColumn] = explode('.', $column, 2);
                $query->whereHas($relation, function (Builder $relationQuery) use ($relationColumn, $value) {
                    $this->applyFilterCondition($relationQuery, $relationColumn, $value);
                });
            } else {
                $this->applyFilterCondition($query, $column, $value);
            }
        }
    }

    /**
     * Apply filter condition (supports arrays for IN queries)
     */
    protected function applyFilterCondition(Builder $query, string $column, mixed $value): void
    {
        if (is_array($value)) {
            $query->whereIn($column, $value);
        } else {
            $query->where($column, $value);
        }
    }

    /**
     * Apply date range filters (_from, _to suffixes)
     */
    protected function applyDateRangeFilters(Builder $query): void
    {
        $dateRangeFilters = collect($this->request->all())
            ->filter(fn($value, $key) => (str_ends_with($key, '_from') || str_ends_with($key, '_to')) && filled($value));

        foreach ($dateRangeFilters as $key => $value) {
            if (str_ends_with($key, '_from')) {
                $column = str_replace('_from', '', $key);
                $query->whereDate($column, '>=', $value);
            } elseif (str_ends_with($key, '_to')) {
                $column = str_replace('_to', '', $key);
                $query->whereDate($column, '<=', $value);
            }
        }
    }

    /**
     * Apply sorting to query
     */
    protected function applySorting(Builder $query, array $config): void
    {
        $sortBy = $this->request->input('sort') ?? $this->request->input('sort_by') ?? $config['defaultSort'];
        $sortDirection = $this->request->input('order') ?? $this->request->input('sort_direction') ?? $config['defaultDirection'];

        // Validate sort column is sortable
        if ($sortBy && (empty($config['sortable']) || in_array($sortBy, $config['sortable']))) {
            $query->orderBy($sortBy, $sortDirection);
        } elseif ($config['defaultSort']) {
            $query->orderBy($config['defaultSort'], $config['defaultDirection']);
        }
    }

    /**
     * Cache the response
     */
    protected function cacheResponse(string $modelClass, callable $callback)
    {
        $cacheKey = $this->generateCacheKey($modelClass);
        return Cache::remember($cacheKey, self::CACHE_TTL, $callback);
    }

    /**
     * Generate cache key based on request params
     */
    protected function generateCacheKey(string $modelClass): string
    {
        $params = [
            'model' => $modelClass,
            'query' => $this->request->all(),
            'user_id' => Auth::id(),
        ];

        return 'model:list:' . md5(json_encode($params));
    }

    /**
     * Get default configuration
     */
    protected function getDefaultConfig(): array
    {
        return [
            'searchable' => [],
            'filterable' => [],
            'sortable' => [],
            'with' => [],
            'withCount' => [],
            'scopes' => [],
            'defaultSort' => null,
            'defaultDirection' => 'asc',
            'perPage' => 30,
            'cache' => false,
            'customFilters' => null,
        ];
    }
}
