import { useMutation, useQueryClient } from '@tanstack/react-query'

import { httpDelete, httpPost, httpPut, toApiError, getErrorMessage } from '@/lib/http'
import { toast } from '@/stores/toast-store'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MutationOptions {
    /** Mensagem de sucesso customizada */
    successMessage?: string
    /** Mensagem de erro customizada */
    errorMessage?: string
    /** Callback após sucesso */
    onSuccess?: () => void
    /** Callback após erro */
    onError?: (error: unknown) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// useDeleteResource - Hook genérico para deletar qualquer recurso
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook genérico para deletar qualquer recurso da API.
 * Segue a convenção REST: DELETE /api/v1/{resourceName}/{id}
 *
 * @param resourceName - Nome do recurso (ex: 'users', 'clients', 'products')
 * @param options - Opções de configuração
 *
 * @example
 * // Uso básico
 * const deleteClient = useDeleteResource('clients')
 * deleteClient.mutate(clientId)
 *
 * @example
 * // Com mensagem customizada
 * const deleteUser = useDeleteResource('users', {
 *   successMessage: 'Usuário removido!',
 * })
 *
 * @example
 * // Com callback
 * const deleteProduct = useDeleteResource('products', {
 *   onSuccess: () => refetch(),
 * })
 */
export function useDeleteResource(
    resourceName: string,
    options?: MutationOptions,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number | string) =>
            httpDelete(`/api/v1/${resourceName}/${id}`),
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
                options?.successMessage ??
                `Registro removido com sucesso!`
            )
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            const apiError = toApiError(error)
            toast.error(
                options?.errorMessage ??
                getErrorMessage(apiError)
            )
            options?.onError?.(error)
        },
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// useCreateResource - Hook genérico para criar qualquer recurso
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook genérico para criar qualquer recurso na API.
 * Segue a convenção REST: POST /api/v1/{resourceName}
 *
 * @param resourceName - Nome do recurso (ex: 'users', 'clients', 'products')
 * @param options - Opções de configuração
 *
 * @example
 * const createClient = useCreateResource('clients')
 * createClient.mutate({ name: 'João', email: 'joao@email.com' })
 */
export function useCreateResource<TInput extends object>(
    resourceName: string,
    options?: MutationOptions,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: TInput) =>
            httpPost(`/api/v1/${resourceName}`, data),
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
                options?.successMessage ??
                `Registro criado com sucesso!`
            )
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            const apiError = toApiError(error)
            toast.error(
                options?.errorMessage ??
                getErrorMessage(apiError)
            )
            options?.onError?.(error)
        },
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// useUpdateResource - Hook genérico para atualizar qualquer recurso
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook genérico para atualizar qualquer recurso na API.
 * Segue a convenção REST: PUT /api/v1/{resourceName}/{id}
 *
 * @param resourceName - Nome do recurso (ex: 'users', 'clients', 'products')
 * @param options - Opções de configuração
 *
 * @example
 * const updateClient = useUpdateResource('clients')
 * updateClient.mutate({ id: 1, data: { name: 'João Silva' } })
 */
export function useUpdateResource<TInput extends object>(
    resourceName: string,
    options?: MutationOptions,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: Partial<TInput> }) =>
            httpPut(`/api/v1/${resourceName}/${id}`, data),
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
                options?.successMessage ??
                `Registro atualizado com sucesso!`
            )
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            const apiError = toApiError(error)
            toast.error(
                options?.errorMessage ??
                getErrorMessage(apiError)
            )
            options?.onError?.(error)
        },
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// useBulkDeleteResource - Hook genérico para deletar múltiplos recursos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook genérico para deletar múltiplos recursos da API.
 *
 * @param resourceName - Nome do recurso (ex: 'users', 'clients', 'products')
 * @param options - Opções de configuração
 *
 * @example
 * const bulkDelete = useBulkDeleteResource('clients')
 * bulkDelete.mutate([1, 2, 3])
 */
export function useBulkDeleteResource(
    resourceName: string,
    options?: MutationOptions,
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: (number | string)[]) => {
            // Deleta cada item individualmente
            await Promise.all(
                ids.map((id) => httpDelete(`/api/v1/${resourceName}/${id}`))
            )
        },
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
                options?.successMessage ??
                `Registros removidos com sucesso!`
            )
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            const apiError = toApiError(error)
            toast.error(
                options?.errorMessage ??
                getErrorMessage(apiError)
            )
            options?.onError?.(error)
        },
    })
}
