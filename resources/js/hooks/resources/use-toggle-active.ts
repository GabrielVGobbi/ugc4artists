import { useMutation, useQueryClient } from '@tanstack/react-query'

import { httpPatch, toApiError, getErrorMessage } from '@/lib/http'
import { toast } from '@/stores/toast-store'

interface ToggleActiveOptions {
    /** Mensagem de sucesso customizada */
    successMessage?: string
    /** Mensagem de erro customizada */
    errorMessage?: string
    /** Callback após sucesso */
    onSuccess?: () => void
    /** Callback após erro */
    onError?: (error: unknown) => void
}

/**
 * Hook para ativar/desativar qualquer recurso.
 *
 * @param resourceName - Nome do recurso (ex: 'vehicles', 'drivers', etc)
 * @param options - Opções de configuração
 *
 * @example
 * const toggleActive = useToggleActive('vehicles', {
 *   successMessage: 'Status alterado com sucesso!',
 * })
 *
 * toggleActive.mutate(vehicleId)
 */
export function useToggleActive(
    resourceName: string,
    options?: ToggleActiveOptions,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number | string) =>
            httpPatch(`/api/v1/${resourceName}/${id}/toggle-active`),
        onSuccess: async () => {
            // Invalida o cache
            await queryClient.invalidateQueries({
                queryKey: [resourceName],
            })

            // Força refetch imediato de todas as queries ativas desse recurso
            await queryClient.refetchQueries({
                queryKey: [resourceName],
                type: 'active',
            })

            toast.success(
                options?.successMessage ?? 'Status alterado com sucesso!'
            )
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            const apiError = toApiError(error)
            toast.error(
                options?.errorMessage ?? getErrorMessage(apiError)
            )
            options?.onError?.(error)
        },
    })
}
