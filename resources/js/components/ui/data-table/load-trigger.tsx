import { useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/data-table/use-intersection-observer'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for the LoadTrigger component.
 */
export interface LoadTriggerProps {
	/** Callback when trigger becomes visible */
	onVisible: () => void

	/** Root element for intersection observer */
	root?: Element | null

	/** Root margin for early triggering (default: '200px') */
	rootMargin?: string

	/** Whether the trigger is active */
	isActive: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Invisible element that triggers data loading via Intersection Observer.
 *
 * This component is used at the bottom of infinite scroll lists to detect
 * when the user has scrolled near the end and trigger loading of more data.
 *
 * The component is hidden from screen readers (aria-hidden="true") to avoid
 * confusion, as it has no semantic meaning for assistive technologies.
 *
 * @example
 * ```tsx
 * <LoadTrigger
 *   onVisible={fetchNextPage}
 *   isActive={hasNextPage && !isFetchingNextPage}
 *   rootMargin="200px"
 * />
 * ```
 *
 * @requirement 2.1 - Intersection Observer for load trigger detection
 * @requirement 8.5 - Load trigger hidden from screen readers
 */
export function LoadTrigger({
	onVisible,
	root = null,
	rootMargin = '200px',
	isActive,
}: LoadTriggerProps) {
	const { ref, isIntersecting } = useIntersectionObserver({
		root,
		rootMargin,
		threshold: 0,
		enabled: isActive,
	})

	// Call onVisible when the trigger becomes visible and is active
	useEffect(() => {
		if (isIntersecting && isActive) {
			onVisible()
		}
	}, [isIntersecting, isActive, onVisible])

	return (
		<div
			ref={ref}
			aria-hidden="true"
			className="h-1 w-full"
		/>
	)
}

export default LoadTrigger
