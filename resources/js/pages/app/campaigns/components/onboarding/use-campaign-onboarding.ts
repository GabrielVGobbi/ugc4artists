import { useState, useEffect, useCallback } from 'react'
import { ONBOARDING_STORAGE_KEY, ONBOARDING_CONFIG } from './onboarding-config'

interface UseCampaignOnboardingOptions {
    /** Se true, não verifica o localStorage e sempre começa fechado */
    disabled?: boolean
    /** Se true, sempre mostra o onboarding (ignora localStorage) */
    forceShow?: boolean
}

interface UseCampaignOnboardingReturn {
    /** Se o modal de onboarding está aberto */
    isOpen: boolean
    /** Abre o modal de onboarding */
    open: () => void
    /** Fecha o modal de onboarding */
    close: () => void
    /** Toggle do modal */
    toggle: () => void
    /** Se o usuário já completou o onboarding */
    hasCompleted: boolean
    /** Reseta o estado (remove do localStorage) */
    reset: () => void
    /** Handler para o onOpenChange do Dialog */
    setIsOpen: (open: boolean) => void
}

/**
 * Hook para gerenciar o estado do onboarding de criação de campanha
 *
 * @example
 * ```tsx
 * const { isOpen, setIsOpen, open } = useCampaignOnboarding()
 *
 * return (
 *   <>
 *     <Button onClick={open}>Ver tutorial</Button>
 *     <OnboardingModal open={isOpen} onOpenChange={setIsOpen} />
 *   </>
 * )
 * ```
 */
export function useCampaignOnboarding(
    options: UseCampaignOnboardingOptions = {}
): UseCampaignOnboardingReturn {
    const { disabled = false, forceShow = false } = options

    const [isOpen, setIsOpen] = useState(false)
    const [hasCompleted, setHasCompleted] = useState(false)

    // Verifica localStorage na montagem
    useEffect(() => {
        if (disabled) return

        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
        setHasCompleted(completed)

        // Auto-show na primeira visita
        if (ONBOARDING_CONFIG.autoShowOnFirstVisit && !completed) {
            setIsOpen(true)
        }

        // Force show (para debug/preview)
        if (forceShow) {
            setIsOpen(true)
        }
    }, [disabled, forceShow])

    const open = useCallback(() => {
        setIsOpen(true)
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
    }, [])

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    const reset = useCallback(() => {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY)
        setHasCompleted(false)
    }, [])

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            // Marca como completado quando fecha
            setHasCompleted(true)
        }
    }, [])

    return {
        isOpen,
        open,
        close,
        toggle,
        hasCompleted,
        reset,
        setIsOpen: handleOpenChange,
    }
}
