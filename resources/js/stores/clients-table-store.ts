import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ListParams } from '@/lib/http'

interface ClientsTableState {
    page: number
    perPage: number
    search: string
    sortBy: string | null
    sortDirection: 'asc' | 'desc'
    filters: Record<string, unknown>
}

interface ClientsTableActions {
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    setSearch: (search: string) => void
    setSort: (sortBy: string) => void
    setFilter: (key: string, value: unknown) => void
    resetFilters: () => void
    reset: () => void
}

type ClientsTableStore = ClientsTableState & ClientsTableActions

const initialState: ClientsTableState = {
    page: 1,
    perPage: 10,
    search: '',
    sortBy: null,
    sortDirection: 'desc',
    filters: {},
}

/**
 * Store para estado da tabela de clientes
 */
export const useClientsTableStore = create<ClientsTableStore>()(
    persist(
        (set) => ({
            ...initialState,
            setPage: (page) => set({ page }),
            setPerPage: (perPage) => set({ perPage, page: 1 }),
            setSearch: (search) => set({ search, page: 1 }),
            setSort: (sortBy) =>
                set((state) => ({
                    sortBy,
                    sortDirection:
                        state.sortBy === sortBy && state.sortDirection === 'asc'
                            ? 'desc'
                            : 'asc',
                })),
            setFilter: (key, value) =>
                set((state) => ({
                    filters: { ...state.filters, [key]: value },
                    page: 1,
                })),
            resetFilters: () => set({ filters: {}, page: 1 }),
            reset: () => set(initialState),
        }),
        { name: 'clients-table' }
    )
)

/**
 * Hook para obter os parâmetros de listagem
 */
export function useClientsListParams(): ListParams {
    const { page, perPage, search, sortBy, sortDirection, filters } =
        useClientsTableStore()

    return useMemo(
        () => ({
            page,
            per_page: perPage,
            search: search || undefined,
            sort_by: sortBy ?? undefined,
            sort_direction: sortBy ? sortDirection : undefined,
            ...filters,
        }),
        [page, perPage, search, sortBy, sortDirection, filters]
    )
}
