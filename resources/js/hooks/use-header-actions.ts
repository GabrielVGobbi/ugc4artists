import { useEffect, type ReactNode } from 'react'
import { useHeader } from '@/contexts/header-context'

/**
 * Hook para definir ações customizadas no header do app-layout
 * As ações são automaticamente limpas quando o componente é desmontado
 *
 * @example
 * useHeaderActions(
 *   <Button onClick={() => router.visit('/back')}>
 *     <ArrowLeft /> Voltar
 *   </Button>
 * )
 */
export function useHeaderActions(actions: ReactNode) {
    const { setHeaderActions } = useHeader()

    useEffect(() => {
        setHeaderActions(actions)
        return () => setHeaderActions(null)
    }, [actions, setHeaderActions])
}
