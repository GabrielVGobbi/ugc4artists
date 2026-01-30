import { router, usePage } from '@inertiajs/react'
import { useEffect, useRef } from 'react'
import { toast } from '@/components/ui/sonner'

interface FlashProps {
    errors?: Record<string, string>
    flash?: {
        success?: string
        error?: string
        warning?: string
        info?: string
    }
    [key: string]: unknown
}

/**
 * Hook para exibir erros de validação e mensagens flash automaticamente
 * Usa o evento router.on('finish') para detectar cada requisição
 */
export function useFlashErrors() {
    const { props } = usePage<FlashProps>()
    const propsRef = useRef(props)
    const isFirstRender = useRef(true)

    // Mantém a ref atualizada
    useEffect(() => {
        propsRef.current = props
    }, [props])

    // Exibe erros na montagem inicial
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            showErrors(props)
        }
    }, [])

    // Escuta cada requisição finalizada do Inertia
    useEffect(() => {
        const removeListener = router.on('finish', () => {
            showErrors(propsRef.current)
        })

        return () => removeListener()
    }, [])
}

function showErrors(props: FlashProps) {
    // Exibir erros de validação do Laravel
    console.log(props.errors);
    if (props.errors && Object.keys(props.errors).length > 0) {
        Object.entries(props.errors).forEach(([field, message]) => {
            toast.error(message, {
                id: `error-${field}-${Date.now()}`,
                duration: 5000,
            })
        })
    }

    // Exibir mensagens flash
    if (props.flash?.success) {
        toast.success(props.flash.success)
    }
    if (props.flash?.error) {
        toast.error(props.flash.error)
    }
    if (props.flash?.warning) {
        toast.warning(props.flash.warning)
    }
    if (props.flash?.info) {
        toast.info(props.flash.info)
    }
}
