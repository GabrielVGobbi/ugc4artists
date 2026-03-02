import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from '@/stores/toast-store'


export interface DriverVehicle {
    id: number
    name: string
    model: string | null
    board: string | null
    type: string | null
    color: string | null
    year: number | null
    is_primary: boolean
    associated_at: string
}

export interface AvailableVehicle {
    id: number
    name: string
    model: string | null
    board: string | null
    type: string | null
}

export interface AttachVehicleData {
    vehicle_id: number
    is_primary?: boolean
}

interface UseDriverVehiclesProps {
    driverId: string | number
}

export function useDriverVehicles({ driverId }: UseDriverVehiclesProps) {
    const queryClient = useQueryClient()
    const queryKey = ['drivers', driverId, 'vehicles']

    // Lista veículos do motorista
    const { data: vehicles = [], isLoading } = useQuery<DriverVehicle[]>({
        queryKey,
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/drivers/${driverId}/vehicles`)
            return data.data
        },
        enabled: !!driverId,
    })

    // Lista veículos disponíveis
    const { data: availableVehicles = [] } = useQuery<AvailableVehicle[]>({
        queryKey: ['vehicles', 'available'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/vehicles/available')
            return data.data
        },
    })

    // Associar veículo
    const attach = useMutation({
        mutationFn: async (vehicleData: AttachVehicleData) => {
            const { data } = await axios.post(
                `/api/v1/drivers/${driverId}/vehicles`,
                vehicleData
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            toast.success('Veículo associado com sucesso!');

        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || 'Erro ao associar veículo'
            toast.error(message);
        },
    })

    // Remover veículo
    const detach = useMutation({
        mutationFn: async (vehicleId: number) => {
            const { data } = await axios.delete(
                `/api/v1/drivers/${driverId}/vehicles/${vehicleId}`
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            toast.success('Veículo removido com sucesso!');

        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || 'Erro ao remover veículo'
            toast.error(message);
        },
    })

    // Definir como principal
    const setPrimary = useMutation({
        mutationFn: async (vehicleId: number) => {
            const { data } = await axios.patch(
                `/api/v1/drivers/${driverId}/vehicles/${vehicleId}/primary`
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message ||
                'Erro ao definir veículo principal'
            toast.error(message);
        },
    })

    return {
        vehicles,
        availableVehicles,
        isLoading,
        attach,
        detach,
        setPrimary,
    }
}
