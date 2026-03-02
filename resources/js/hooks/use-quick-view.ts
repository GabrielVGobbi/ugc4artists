import { useCallback, useState } from 'react'
import type { UseQuickViewReturn } from '@/types/quick-view'

interface QuickViewState {
    resourceName: string
    resourceId: string | number
    title: string
}

/**
 * Hook that manages the open/close state and selected resource
 * parameters for the QuickViewPanel with navigation history support.
 *
 * @example
 * ```tsx
 * const { isOpen, resourceName, resourceId, open, close, back, canGoBack } = useQuickView()
 *
 * <QuickViewTrigger onOpen={open} resourceName="clients" resourceId={1}>
 *   <span>Client Name</span>
 * </QuickViewTrigger>
 *
 * <QuickViewPanel isOpen={isOpen} onClose={close} resourceName={resourceName} resourceId={resourceId} />
 * ```
 */
function useQuickView(): UseQuickViewReturn {
    const [isOpen, setIsOpen] = useState(false)
    const [history, setHistory] = useState<QuickViewState[]>([])
    const [currentIndex, setCurrentIndex] = useState(-1)

    const currentState = currentIndex >= 0 ? history[currentIndex] : null

    const open = useCallback((name: string, id: string | number, title: string) => {
        const newState: QuickViewState = {
            resourceName: name,
            resourceId: id,
            title,
        }

        setHistory((prev) => {
            // Remove future history if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1)
            return [...newHistory, newState]
        })
        setCurrentIndex((prev) => prev + 1)
        setIsOpen(true)
    }, [currentIndex])

    const back = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }
    }, [currentIndex])

    const close = useCallback(() => {
        setIsOpen(false)
        // Clear history after animation
        setTimeout(() => {
            setHistory([])
            setCurrentIndex(-1)
        }, 300)
    }, [])

    const canGoBack = currentIndex > 0

    return {
        isOpen,
        resourceName: currentState?.resourceName || null,
        resourceId: currentState?.resourceId || null,
        title: currentState?.title || '',
        open,
        close,
        back,
        canGoBack,
    }
}

export { useQuickView }
