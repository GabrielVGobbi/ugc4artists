import { useCallback, useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for configuring the Intersection Observer.
 */
export interface UseIntersectionObserverOptions {
	/** Root element for the intersection observer (default: null = viewport) */
	root?: Element | null

	/** Root margin for early triggering (default: '200px') */
	rootMargin?: string

	/** Threshold(s) at which to trigger the callback (default: 0) */
	threshold?: number | number[]

	/** Whether the observer is enabled (default: true) */
	enabled?: boolean
}

/**
 * Return value from the useIntersectionObserver hook.
 */
export interface UseIntersectionObserverReturn {
	/** Ref callback to attach to the target element */
	ref: React.RefCallback<Element>

	/** Current intersection observer entry */
	entry: IntersectionObserverEntry | null

	/** Whether the target element is currently intersecting */
	isIntersecting: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom hook that wraps the Intersection Observer API for detecting when
 * an element enters or exits the viewport (or a specified root element).
 *
 * This hook is primarily used for implementing infinite scroll functionality,
 * where we need to detect when a "load trigger" element becomes visible to
 * fetch more data.
 *
 * @param options - Configuration options for the observer
 * @returns Object containing ref callback, entry, and isIntersecting state
 *
 * @example
 * ```tsx
 * const { ref, isIntersecting } = useIntersectionObserver({
 *   rootMargin: '200px',
 *   enabled: hasMoreData,
 * })
 *
 * useEffect(() => {
 *   if (isIntersecting) {
 *     fetchNextPage()
 *   }
 * }, [isIntersecting, fetchNextPage])
 *
 * return (
 *   <div>
 *     {data.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref} aria-hidden="true" />
 *   </div>
 * )
 * ```
 *
 * @requirement 2.1 - Intersection Observer for load trigger detection
 * @requirement 2.5 - Configurable rootMargin for early triggering
 * @requirement 10.3 - Proper cleanup on unmount
 */
export function useIntersectionObserver({
	root = null,
	rootMargin = '200px',
	threshold = 0,
	enabled = true,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
	const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
	const [node, setNode] = useState<Element | null>(null)

	// Effect to set up and clean up the Intersection Observer
	useEffect(() => {
		// Early return if observer is disabled or no node to observe
		if (!enabled || !node) {
			return
		}

		// Check for browser support
		if (typeof IntersectionObserver === 'undefined') {
			console.warn('IntersectionObserver is not supported in this browser')
			return
		}

		// Create the observer with the provided options
		const observer = new IntersectionObserver(
			([observerEntry]) => {
				setEntry(observerEntry)
			},
			{
				root,
				rootMargin,
				threshold,
			},
		)

		// Start observing the target node
		observer.observe(node)

		// Cleanup function to disconnect the observer on unmount or dependency change
		return () => {
			observer.disconnect()
		}
	}, [node, root, rootMargin, threshold, enabled])

	// Reset entry when observer is disabled
	useEffect(() => {
		if (!enabled) {
			setEntry(null)
		}
	}, [enabled])

	// Ref callback to set the node - using useCallback for stable reference
	const ref = useCallback((element: Element | null) => {
		setNode(element)
	}, [])

	return {
		ref,
		entry,
		isIntersecting: entry?.isIntersecting ?? false,
	}
}

export default useIntersectionObserver
