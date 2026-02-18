import { AlertCircle } from 'lucide-react'
import {
	useRef,
	useState,
	useEffect,
	useLayoutEffect,
	useCallback,
	type ReactNode,
	type RefObject,
} from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { DataTableEndOfList } from './data-table-end-of-list'
import { LoadTrigger } from './load-trigger'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for the InfiniteScrollContainer component.
 */
export interface InfiniteScrollContainerProps {
	/** Children to render inside the scroll container */
	children: ReactNode

	/** Height of the container (CSS value or number in pixels) */
	height: string | number

	/** Sticky header content to render at the top */
	stickyHeader?: ReactNode

	/** Whether currently loading more data */
	isLoadingMore: boolean

	/** Whether there's more data to load */
	hasMore: boolean

	/** Callback when load trigger is visible */
	onLoadMore: () => void

	/** Threshold for triggering load (default: '200px') */
	threshold?: string

	/** End of list message (default: 'Todos os itens foram carregados.') */
	endMessage?: string

	/** External scroll container ref for custom scroll handling */
	externalScrollRef?: RefObject<HTMLElement>

	/** Additional CSS classes for the container */
	className?: string

	/** Error object when fetch fails (null when no error) */
	error?: Error | null

	/** Callback to retry the failed fetch */
	onRetry?: () => void

	/** Number of items currently loaded */
	loadedCount?: number

	/** Total number of items available */
	totalCount?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts height prop to CSS value.
 * Numbers are treated as pixels, strings are used as-is.
 */
const formatHeight = (height: string | number): string => {
	if (typeof height === 'number') {
		return `${height}px`
	}
	return height
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to detect when content doesn't fill the viewport and trigger loading.
 *
 * This hook compares the scrollHeight with clientHeight of the container.
 * If scrollHeight <= clientHeight (content doesn't fill viewport) and there's
 * more data available, it triggers onLoadMore to fetch additional pages.
 *
 * Uses useLayoutEffect for synchronous measurement after DOM updates to ensure
 * accurate height comparisons before the browser paints.
 *
 * @param containerRef - Ref to the scroll container element
 * @param hasMore - Whether there's more data to load
 * @param isLoadingMore - Whether currently loading more data
 * @param onLoadMore - Callback to fetch more data
 *
 * @requirement 2.6 - Auto-fetch until viewport is filled or all data loaded
 */
function useViewportAutoFill(
	containerRef: RefObject<HTMLElement | null>,
	hasMore: boolean,
	isLoadingMore: boolean,
	onLoadMore: () => void
): void {
	// Track if we've already triggered a load to prevent multiple calls
	const hasTriggeredRef = useRef(false)

	// Reset trigger flag when loading completes
	useEffect(() => {
		if (!isLoadingMore) {
			hasTriggeredRef.current = false
		}
	}, [isLoadingMore])

	// Check if viewport needs more data after each render
	useLayoutEffect(() => {
		const container = containerRef.current

		// Early return if conditions aren't met
		if (!container) return
		if (!hasMore) return
		if (isLoadingMore) return
		if (hasTriggeredRef.current) return

		// Compare scroll height with client height
		// scrollHeight: total height of content including overflow
		// clientHeight: visible height of the container
		const { scrollHeight, clientHeight } = container

		// If content doesn't fill the viewport, fetch more data
		// We use a small buffer (1px) to account for rounding differences
		const isViewportNotFilled = scrollHeight <= clientHeight + 1

		if (isViewportNotFilled) {
			hasTriggeredRef.current = true
			onLoadMore()
		}
	})
}

/**
 * Hook to preserve scroll position when new data is appended.
 *
 * This hook stores the scrollTop value before React renders new children,
 * and restores it synchronously after the render using useLayoutEffect.
 * This prevents any visual scroll jumping when new data is appended at the bottom.
 *
 * The hook uses a ref to track the previous scroll position and compares
 * the children reference to detect when new data has been appended.
 *
 * Note: In most cases, browsers handle appending content at the bottom correctly
 * without changing scrollTop. However, this hook provides a safety net for edge
 * cases where layout shifts or browser quirks might cause unexpected scroll jumps.
 *
 * @param containerRef - Ref to the scroll container element
 * @param children - The children being rendered (used to detect changes)
 *
 * @requirement 6.5 - Preserve scroll position when new data is appended
 */
function useScrollPositionPreservation(
	containerRef: RefObject<HTMLElement | null>,
	children: ReactNode
): void {
	// Store the scroll position before render
	const scrollPositionRef = useRef<number | null>(null)
	// Track the previous children reference to detect changes
	const previousChildrenRef = useRef<ReactNode>(children)

	// Before render: capture current scroll position if children are changing
	// This runs synchronously before the DOM is updated
	useLayoutEffect(() => {
		const container = containerRef.current

		// Only capture scroll position if we have a container and children changed
		if (container && previousChildrenRef.current !== children) {
			scrollPositionRef.current = container.scrollTop
		}
	})

	// After render: restore scroll position if it was captured
	// This runs synchronously after the DOM is updated but before paint
	useLayoutEffect(() => {
		const container = containerRef.current
		const savedScrollTop = scrollPositionRef.current

		// Only restore if we have a saved position and children changed
		if (
			container &&
			savedScrollTop !== null &&
			previousChildrenRef.current !== children
		) {
			// Check if scroll position changed unexpectedly
			// This handles edge cases where the browser might have shifted the scroll
			if (container.scrollTop !== savedScrollTop) {
				container.scrollTop = savedScrollTop
			}

			// Clear the saved position after restoration
			scrollPositionRef.current = null
		}

		// Update the previous children reference
		previousChildrenRef.current = children
	}, [children, containerRef])
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scroll container for infinite scroll tables.
 *
 * This component wraps table content with a scrollable container that supports:
 * - Configurable height
 * - Sticky header content
 * - Automatic load triggering via Intersection Observer
 * - Loading spinner when fetching more data
 * - End of list indicator when all data is loaded
 * - External scroll container support for custom layouts
 * - Viewport auto-fill: automatically fetches more data if initial data doesn't fill viewport
 * - Scroll position preservation: maintains scroll position when new data is appended
 * - Error state with retry button: displays error message and retry option when fetch fails
 *
 * The container uses smooth scrolling behavior for a polished user experience.
 *
 * @example
 * ```tsx
 * <InfiniteScrollContainer
 *   height="70vh"
 *   stickyHeader={<TableHeader />}
 *   isLoadingMore={isFetchingNextPage}
 *   hasMore={hasNextPage}
 *   onLoadMore={fetchNextPage}
 *   threshold="200px"
 *   endMessage="No more items to load"
 *   error={error}
 *   onRetry={refetch}
 * >
 *   <TableBody data={data} />
 * </InfiniteScrollContainer>
 * ```
 *
 * @requirement 5.1 - Configurable scroll container height
 * @requirement 5.2 - Default maxHeight with sensible default
 * @requirement 5.3 - External scroll container ref support
 * @requirement 5.4 - Intersection Observer attached to container
 * @requirement 5.5 - Smooth scrolling behavior
 * @requirement 6.2 - Loading spinner when fetching more data
 * @requirement 6.4 - Error message with retry button when fetch fails
 * @requirement 2.6 - Auto-fetch until viewport is filled or all data loaded
 * @requirement 6.5 - Preserve scroll position when new data is appended
 */
export function InfiniteScrollContainer({
	children,
	height,
	stickyHeader,
	isLoadingMore,
	hasMore,
	onLoadMore,
	threshold = '200px',
	endMessage = 'Todos os itens foram carregados.',
	externalScrollRef,
	className,
	error = null,
	onRetry,
	loadedCount,
	totalCount,
}: InfiniteScrollContainerProps) {
	const internalScrollRef = useRef<HTMLDivElement>(null)

	// Track the scroll container element for the Intersection Observer
	// We need to use state to trigger re-render when the ref is set
	const [scrollRoot, setScrollRoot] = useState<Element | null>(null)

	// Memoize onLoadMore to prevent unnecessary effect triggers
	const handleLoadMore = useCallback(() => {
		onLoadMore()
	}, [onLoadMore])

	// Get the effective scroll container ref
	const effectiveScrollRef = externalScrollRef ?? internalScrollRef

	// Viewport auto-fill: automatically fetch more data if content doesn't fill viewport
	// This ensures the user always sees a full page of data when possible
	useViewportAutoFill(
		effectiveScrollRef as RefObject<HTMLElement | null>,
		hasMore,
		isLoadingMore,
		handleLoadMore
	)

	// Scroll position preservation: maintain scroll position when new data is appended
	// This prevents visual scroll jumping when new rows are added at the bottom
	useScrollPositionPreservation(
		effectiveScrollRef as RefObject<HTMLElement | null>,
		children
	)

	// Update scroll root when refs change
	useEffect(() => {
		if (externalScrollRef?.current) {
			setScrollRoot(externalScrollRef.current)
		} else if (internalScrollRef.current) {
			setScrollRoot(internalScrollRef.current)
		}
	}, [externalScrollRef])

	// Also update on mount for internal ref
	useEffect(() => {
		if (!externalScrollRef && internalScrollRef.current) {
			setScrollRoot(internalScrollRef.current)
		}
	}, [externalScrollRef])

	// Determine if load trigger should be active
	// Only active when there's more data and not currently loading
	const isLoadTriggerActive = hasMore && !isLoadingMore

	// Check if we should show the record count
	const showRecordCount = loadedCount !== undefined && totalCount !== undefined

	return (
		<div className="flex flex-col">
			{/* Scrollable container */}
			<div
				ref={externalScrollRef ? undefined : internalScrollRef}
				className={cn(
					'relative overflow-y-auto overflow-x-auto scroll-smooth rounded-sm',
					className
				)}
				style={{ height: formatHeight(height) }}
			>
				{/*
				 * ARIA live region for screen reader announcements.
				 * Announces loading state changes to assistive technologies.
				 * Uses sr-only class to be visually hidden but accessible.
				 * @requirement 8.1 - Announce to screen readers when new data is being loaded
				 * @requirement 8.2 - Announce to screen readers when new data has been loaded
				 */}
				<div
					role="status"
					aria-live="polite"
					aria-atomic="true"
					className="sr-only"
				>
					{isLoadingMore && 'Carregando mais itens...'}
					{error && !isLoadingMore && `Erro: ${error.message || 'Ocorreu um erro ao carregar os dados.'}`}
					{!hasMore && !isLoadingMore && !error && 'Todos os itens foram carregados.'}
				</div>

				{/* Sticky header section */}
				{stickyHeader && (
					<div className="sticky top-0 z-10 bg-card rounded-sm">
						{stickyHeader}
					</div>
				)}

				{/* Main content area */}
				<div className="relative ">
					{children}

					{/* Load trigger - invisible element that triggers loading */}
					<LoadTrigger
						onVisible={onLoadMore}
						root={scrollRoot}
						rootMargin={threshold}
						isActive={isLoadTriggerActive}
					/>

					{/* Loading spinner - shown when fetching more data */}
					{isLoadingMore && (
						<div className="flex items-center justify-center py-6">
							<Spinner className="size-6 text-muted-foreground" />
							<span className="ml-2 text-sm text-muted-foreground">
								Carregando mais itens...
							</span>
						</div>
					)}

					{/*
					 * Error state - shown when fetch fails.
					 * Displays error message with retry button.
					 * Children (loaded data) are preserved above this section.
					 * @requirement 6.4 - Error message with retry button when fetch fails
					 */}
					{error && !isLoadingMore && (
						<div className="flex flex-col items-center justify-center gap-4 py-8">
							<div className="flex items-center gap-2 text-destructive">
								<AlertCircle className="size-5" aria-hidden="true" />
								<p className="text-sm font-medium">
									{error.message || 'Ocorreu um erro ao carregar os dados.'}
								</p>
							</div>
							{onRetry && (
								<Button
									variant="outline"
									size="sm"
									onClick={onRetry}
									aria-label="Tentar carregar novamente"
								>
									Tentar novamente
								</Button>
							)}
						</div>
					)}

					{/* End of list indicator - shown when all data is loaded */}
					{!hasMore && !isLoadingMore && !error && (
						<DataTableEndOfList message={endMessage} />
					)}
				</div>
			</div>

			{/* Fixed footer - Record count info outside scroll container */}
			{showRecordCount && (
				<div className="flex items-center justify-between border-t    py-2">
					<span className="text-sm text-muted-foreground">
						Exibindo {loadedCount} de {totalCount} registros
					</span>
					{isLoadingMore && (
						<span className="text-sm text-muted-foreground">
							Carregando...
						</span>
					)}
				</div>
			)}
		</div>
	)
}

export default InfiniteScrollContainer
