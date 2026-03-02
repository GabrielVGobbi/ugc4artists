import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import AddressApiController from '@/actions/App/Http/Controllers/Api/AddressApiController'

import {
	httpDelete,
	httpGet,
	httpPatch,
	httpPost,
	httpPut,
	getErrorMessage,
	toApiError,
} from '@/lib/http'
import { toast } from '@/stores/toast-store'

import type { Address, AddressableModel, AddressFormData } from '@/types/app/address'

interface ApiResponse<T> {
	data: T
	message?: string
}

interface UseAddressesParams {
	model: AddressableModel
	modelId: string | number
	enabled?: boolean
}

/**
 * Hook for managing addresses of any addressable model.
 * Provides CRUD operations + set default via TanStack Query.
 */
export function useAddresses({
	model,
	modelId,
	enabled = true,
}: UseAddressesParams) {
	const queryClient = useQueryClient()
	const queryKey = ['addresses', model, modelId]

	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const url = AddressApiController.index.url({
				query: { model, model_id: String(modelId) },
			})
			const response = await httpGet<{ data: Address[] }>(url)
			return response.data
		},
		enabled: enabled && !!modelId,
	})

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey })
	}, [queryClient, queryKey])

	const createMutation = useMutation({
		mutationFn: (data: AddressFormData) =>
			httpPost<ApiResponse<Address>>(
				AddressApiController.store.url(),
				{ ...data, model, model_id: modelId },
			),
		onSuccess: (res) => {
			invalidate()
			toast.success(res.message ?? 'Endereço criado com sucesso!')
		},
		onError: (err) => {
			toast.error(getErrorMessage(toApiError(err)))
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string, data: AddressFormData }) =>
			httpPut<ApiResponse<Address>>(
				AddressApiController.update.url(id),
				{ ...data, model, model_id: modelId },
			),
		onSuccess: (res) => {
			invalidate()
			toast.success(res.message ?? 'Endereço atualizado com sucesso!')
		},
		onError: (err) => {
			toast.error(getErrorMessage(toApiError(err)))
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) =>
			httpDelete<ApiResponse<null>>(
				AddressApiController.destroy.url(id),
			),
		onSuccess: (res) => {
			invalidate()
			toast.success(res.message ?? 'Endereço removido com sucesso!')
		},
		onError: (err) => {
			toast.error(getErrorMessage(toApiError(err)))
		},
	})

	const setDefaultMutation = useMutation({
		mutationFn: (id: string) =>
			httpPatch<ApiResponse<Address>>(
				AddressApiController.setDefault.url(id),
			),
		onSuccess: (res) => {
			invalidate()
			toast.success(res.message ?? 'Endereço padrão atualizado!')
		},
		onError: (err) => {
			toast.error(getErrorMessage(toApiError(err)))
		},
	})

	return {
		addresses: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		create: createMutation,
		update: updateMutation,
		remove: deleteMutation,
		setDefault: setDefaultMutation,
	}
}
