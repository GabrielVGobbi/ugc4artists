import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { PaginatedResponse, PaginationMeta } from '@/types/data-table-composite'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters passed to the query function for fetching paginated data.
 */
export interface InfiniteQueryParams {
	/** Page number (1-indexed) */
	page: number
	/** Items per page */
	per_page: number
	/** Search query */
	search?: string
	/** Sort column key */
	sort_by?: string | null
	/** Sort direction */
	sort_direction?: 'asc' | 'desc'
	/**
	 * AbortSignal for request cancellation.
	 * The query function should pass this to fetch/axios to enable cancellation on unmount.
	 * @requirement 3.2 - Cancel pending requests on component unmount
	 */
	signal?: AbortSignal
	/** Additional dynamic parameters */
	[key: string]: unknown
}

/**
 * Options for configuring the useInfiniteTableData hook.
 * @template TData - The data model type
 */
export interface UseInfiniteTableDataOptions<TData> {
	/** Unique query key for TanStack Query cache */
	queryKey: readonly unknown[]

	/** Function to fetch a page of data */
	queryFn: (params: InfiniteQueryParams) => Promise<PaginatedResponse<TData>>

	/** Items per page (default: 20) */
	pageSize?: number

	/** Search query */
	search?: string

	/** Sort column key */
	sortBy?: string | null

	/** Sort direction */
	sortDirection?: 'asc' | 'desc'

	/** Additional filters to pass to the query function */
	filters?: Record<string, unknown>

	/** Whether the query is enabled (default: true) */
	enabled?: boolean
}

/**
 * Return value from the useInfiniteTableData hook.
 * @template TData - The data model type
 */
export interface UseInfiniteTableDataReturn<TData> {
	/** Flattened data from all fetched pages */
	data: TData[]

	/** Total count of items (from first page meta) */
	total: number

	/** Pagination metadata from the first page */
	meta: PaginationMeta | undefined

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
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom hook that integrates TanStack Query's useInfiniteQuery with table-specific logic.
 * Provides infinite scroll data fetching with automatic page flattening and Laravel
 * pagination support.
 *
 * This hook handles:
 * - Integration with TanStack Query's useInfiniteQuery
 * - Page flattening into a single data array
 * - Laravel pagination metadata extraction
 * - Search, sort, and filter parameter support
 * - Automatic query key invalidation on parameter changes
 *
 * @template TData - The data model type
 * @param options - Configuration options for the hook
 * @returns Object containing flattened data, loading states, and pagination controls
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   total,
 *   isLoading,
 *   isFetchingNextPage,
 *   hasNextPage,
 *   fetchNextPage,
 *   refetch,
 *   error,
 * } = useInfiniteTableData({
 *   queryKey: ['clients'],
 *   queryFn: (params) => fetchClients(params),
 *   pageSize: 20,
 *   search: searchQuery,
 *   sortBy: 'name',
 *   sortDirection: 'asc',
 * })
 *
 * // Use with InfiniteScrollContainer
 * <InfiniteScrollContainer
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoadingMore={isFetchingNextPage}
 * >
 *   {data.map(item => <Row key={item.id} {...item} />)}
 * </InfiniteScrollContainer>
 * ```
 *
 * @requirement 9.1 - Integration with TanStack Query's useInfiniteQuery
 * @requirement 9.2 - Returns flattened data from all fetched pages
 * @requirement 9.3 - Exposes fetchNextPage, hasNextPage, and isFetchingNextPage states
 * @requirement 9.4 - Handles cursor-based or offset-based pagination from the server
 * @requirement 9.5 - Supports the same query parameters as the existing useClients hook pattern
 * @requirement 9.6 - Extracts pagination metadata correctly from server responses
 */
export function useInfiniteTableData<TData>({
	queryKey,
	queryFn,
	pageSize = 30,
	search,
	sortBy,
	sortDirection,
	filters,
	enabled = true,
}: UseInfiniteTableDataOptions<TData>): UseInfiniteTableDataReturn<TData> {
	// Build the complete query key including all parameters that affect the query
	// This ensures the query is automatically refetched when parameters change
	// @requirement 3.4 - Reset infinite query when search/sort/filter changes
	// @requirement 7.2 - Column sorting resets and reloads data
	// @requirement 7.3 - Search filtering resets and reloads data
	const fullQueryKey = useMemo(
		() => [...queryKey, { search, sortBy, sortDirection, pageSize, ...filters }],
		[queryKey, search, sortBy, sortDirection, pageSize, filters],
	)

	// Use TanStack Query's useInfiniteQuery for paginated data fetching
	// TanStack Query automatically cancels pending requests on unmount
	// The signal is passed to the queryFn for proper AbortController support
	// @requirement 3.2 - Cancel pending requests on component unmount
	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage: tanstackFetchNextPage,
		refetch: tanstackRefetch,
		error,
	} = useInfiniteQuery({
		queryKey: fullQueryKey,
		queryFn: ({ pageParam, signal }) =>
			queryFn({
				page: pageParam,
				per_page: pageSize,
				search,
				sort_by: sortBy,
				sort_direction: sortDirection,
				signal,
				...filters,
			}),
		getNextPageParam: (lastPage) => {
			// Extract pagination info from Laravel's response format
			const { current_page, last_page } = lastPage.meta
			// Return next page number if there are more pages, undefined otherwise
			return current_page < last_page ? current_page + 1 : undefined
		},
		initialPageParam: 1,
		enabled,
	})

	// Flatten all pages into a single data array using useMemo for performance
	// This ensures we don't recalculate on every render
	const flattenedData = useMemo(
		() => data?.pages.flatMap((page) => page.data) ?? [],
		[data],
	)

	// Extract total count from the first page's metadata
	// The total should be consistent across all pages
	const total = data?.pages[0]?.meta.total ?? 0

	// Extract meta from the first page for additional pagination info
	const meta = data?.pages[0]?.meta

	// Wrap fetchNextPage to provide a simpler interface
	// Includes request deduplication guard to prevent multiple simultaneous requests
	// @requirement 3.1 - Request deduplication
	const fetchNextPage = useCallback(() => {
		// Guard: Don't fetch if already fetching next page
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
	}
}

export default useInfiniteTableData
