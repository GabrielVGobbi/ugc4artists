import { httpGet } from '@/lib/http'
import { PaginatedResponse } from '@/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base parameters for resource list queries
 */
export interface ResourceListParams {
	/** Page number (1-indexed) */
	page?: number
	/** Items per page */
	per_page?: number
	/** Search query */
	search?: string
	/** Sort column key */
	sort_by?: string
	/** Sort direction */
	sort_direction?: 'asc' | 'desc'
	/** Additional filters */
	[key: string]: unknown
}

/**
 * Configuration for the resource list hook
 * @template TData - The resource data type
 */
export interface UseResourceListConfig<TData> {
	/**
	 * Resource endpoint (e.g., '/api/v1/users', '/api/v1/clients')
	 * Can be a string or a function that returns a string
	 */
	endpoint: string | (() => string)

	/**
	 * Query key prefix for TanStack Query cache
	 * @example ['users'], ['clients'], ['products']
	 */
	queryKey: readonly unknown[]

	/**
	 * Items per page (default: 30)
	 */
	pageSize?: number

	/**
	 * Search query
	 */
	search?: string

	/**
	 * Sort column key
	 */
	sortBy?: string

	/**
	 * Sort direction
	 */
	sortDirection?: 'asc' | 'desc'

	/**
	 * Additional filters to pass to the API
	 */
	filters?: Record<string, unknown>

	/**
	 * Whether the query is enabled (default: true)
	 */
	enabled?: boolean

	/**
	 * Custom query function (overrides default API call)
	 * Use this when you need custom logic or different API structure
	 */
	customQueryFn?: (params: ResourceListParams & { signal?: AbortSignal }) => Promise<PaginatedResponse<TData>>

	/**
	 * Transform function to modify the response before returning
	 * Useful for data normalization or adding computed properties
	 */
	transformResponse?: (response: PaginatedResponse<TData>) => PaginatedResponse<TData>

	/**
	 * Interval in milliseconds for automatic refetching, or false to disable.
	 * When enabled, data will be refetched at this interval.
	 * TanStack Query automatically pauses refetching when the browser tab is hidden (Page Visibility API).
	 *
	 * @example
	 * refetchInterval: 30_000 // Refetch every 30 seconds
	 * refetchInterval: false // Disable automatic refetching
	 *
	 * @default false
	 */
	refetchInterval?: number | false

	/**
	 * Whether to continue refetching while the browser tab is in the background.
	 * Most use cases should keep this false to reduce unnecessary server load.
	 *
	 * @default false
	 */
	refetchIntervalInBackground?: boolean
}

/**
 * Return value from the useResourceList hook
 * @template TData - The resource data type
 */
export interface UseResourceListReturn<TData> {
	/** Flattened data from all fetched pages */
	data: TData[]

	/** Total count of items (from first page meta) */
	total: number

	/** Pagination metadata from the first page */
	meta: PaginatedResponse<TData>['meta'] | undefined

	/** Whether initial data is loading */
	isLoading: boolean

	/** Whether fetching next page */
	isFetchingNextPage: boolean

	/** Whether there are more pages to fetch */
	hasNextPage: boolean

	/** Function to fetch the next page */
	fetchNextPage: () => void

	/** Function to refetch all data from the beginning */
	refetch: () => void

	/** Error if any occurred during fetching */
	error: Error | null

	/** Whether the query is currently fetching (includes background refetches) */
	isFetching: boolean

	/** Timestamp of when the data was last successfully updated */
	dataUpdatedAt: number | undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Query Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default query function that follows REST conventions
 * Makes a GET request to the endpoint with query parameters
 */
async function defaultQueryFn<TData>(
	endpoint: string,
	params: ResourceListParams & { signal?: AbortSignal }
): Promise<PaginatedResponse<TData>> {
	const { signal, ...queryParams } = params

	// Build query string from params
	const searchParams = new URLSearchParams()

	Object.entries(queryParams).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			searchParams.append(key, String(value))
		}
	})

	const url = `${endpoint}?${searchParams.toString()}`

	return httpGet<PaginatedResponse<TData>>(url, { signal })
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic hook for fetching paginated resource lists with infinite scroll support.
 *
 * This hook provides a standardized way to fetch any resource from your API with:
 * - Automatic pagination (infinite scroll)
 * - Search, sort, and filter support
 * - Type-safe responses
 * - Request cancellation on unmount
 * - Customizable query logic
 *
 * @template TData - The resource data type
 * @param config - Configuration options
 * @returns Object containing data, loading states, and pagination controls
 *
 * @example
 * // Basic usage with default API conventions
 * const users = useResourceList<User>({
 *   endpoint: '/api/v1/users',
 *   queryKey: ['users'],
 *   search: searchQuery,
 *   sortBy: 'name',
 *   sortDirection: 'asc',
 * })
 *
 * @example
 * // With custom filters
 * const activeClients = useResourceList<Client>({
 *   endpoint: '/api/v1/clients',
 *   queryKey: ['clients', 'active'],
 *   filters: { status: 'active', type: 'premium' },
 * })
 *
 * @example
 * // With custom query function
 * const products = useResourceList<Product>({
 *   endpoint: '/api/v1/products',
 *   queryKey: ['products'],
 *   customQueryFn: async (params) => {
 *     // Custom logic here
 *     return fetchProductsWithSpecialLogic(params)
 *   },
 * })
 *
 * @example
 * // With response transformation
 * const orders = useResourceList<Order>({
 *   endpoint: '/api/v1/orders',
 *   queryKey: ['orders'],
 *   transformResponse: (response) => ({
 *     ...response,
 *     data: response.data.map(order => ({
 *       ...order,
 *       totalFormatted: formatCurrency(order.total),
 *     })),
 *   }),
 * })
 */
export function useResourceList<TData>({
	endpoint,
	queryKey,
	pageSize = 30,
	search,
	sortBy,
	sortDirection,
	filters,
	enabled = true,
	customQueryFn,
	transformResponse,
	refetchInterval = false,
	refetchIntervalInBackground = false,
}: UseResourceListConfig<TData>): UseResourceListReturn<TData> {
	// Resolve endpoint (can be string or function)
	const resolvedEndpoint = typeof endpoint === 'function' ? endpoint() : endpoint

	// Build the complete query key including all parameters that affect the query
	// This ensures the query is automatically refetched when parameters change
	const fullQueryKey = useMemo(
		() => [...queryKey, { search, sortBy, sortDirection, pageSize, ...filters }],
		[queryKey, search, sortBy, sortDirection, pageSize, filters],
	)

	// Use TanStack Query's useInfiniteQuery for paginated data fetching
	const {
		data,
		isLoading,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		fetchNextPage: tanstackFetchNextPage,
		refetch: tanstackRefetch,
		error,
		dataUpdatedAt,
	} = useInfiniteQuery({
		queryKey: fullQueryKey,
		queryFn: async ({ pageParam, signal }) => {
			const params: ResourceListParams & { signal?: AbortSignal } = {
				page: pageParam,
				per_page: pageSize,
				search,
				sort_by: sortBy,
				sort_direction: sortDirection,
				signal,
				...filters,
			}

			// Use custom query function if provided, otherwise use default
			const response = customQueryFn
				? await customQueryFn(params)
				: await defaultQueryFn<TData>(resolvedEndpoint, params)

			// Apply transformation if provided
			return transformResponse ? transformResponse(response) : response
		},
		getNextPageParam: (lastPage) => {
			// Extract pagination info from Laravel's response format
			const { current_page, last_page } = lastPage.meta
			// Return next page number if there are more pages, undefined otherwise
			return current_page < last_page ? current_page + 1 : undefined
		},
		initialPageParam: 1,
		enabled,
		// Always refetch on mount so list pages show fresh data after navigation
		// (overrides the global staleTime for list queries)
		refetchOnMount: 'always',
		// Auto-refresh configuration
		refetchInterval,
		refetchIntervalInBackground,
	})

	// Flatten all pages into a single data array
	const flattenedData = useMemo(
		() => data?.pages.flatMap((page) => page.data) ?? [],
		[data],
	)

	// Extract total count from the first page's metadata
	const total = data?.pages[0]?.meta.total ?? 0

	// Extract meta from the first page for additional pagination info
	const meta = data?.pages[0]?.meta

	// Wrap fetchNextPage with deduplication guard
	const fetchNextPage = useCallback(() => {
		if (isFetchingNextPage) {
			return
		}
		tanstackFetchNextPage()
	}, [isFetchingNextPage, tanstackFetchNextPage])

	// Wrap refetch to provide a simpler interface
	const refetch = useCallback(() => {
		tanstackRefetch()
	}, [tanstackRefetch])

	return {
		data: flattenedData,
		total,
		meta,
		isLoading,
		isFetchingNextPage,
		hasNextPage: hasNextPage ?? false,
		fetchNextPage,
		refetch,
		error: error as Error | null,
		isFetching,
		dataUpdatedAt,
	}
}

export default useResourceList
