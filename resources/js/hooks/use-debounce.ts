import { useEffect, useState } from 'react'

/**
 * Debounces a value by delaying updates until the specified delay has elapsed
 * without new changes. Useful for search inputs and other scenarios where you
 * want to avoid excessive updates.
 *
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds before the value is updated
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 * ```
 */
export function useDebounce<T>(value: T, delayMs: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delayMs)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delayMs])

	return debouncedValue
}
