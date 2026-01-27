import { http, toApiError, HttpConfig, ApiError, ApiResponse, ValidationErrors } from './http'
import type { PaginatedResponse } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function api<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    config?: HttpConfig
): Promise<T> {
    try {
        const response = await http.request<T>({
            method,
            url,
            ...(method === 'get' ? { params: data } : { data }),
            ...config,
        })
        return response.data
    } catch (err) {
        throw toApiError(err)
    }
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>, config?: HttpConfig): Promise<T> {
    return api<T>('get', url, params, config)
}

export async function apiPost<T, TBody = unknown>(url: string, body?: TBody, config?: HttpConfig): Promise<T> {
    return api<T>('post', url, body, config)
}

export async function apiPut<T, TBody = unknown>(url: string, body?: TBody, config?: HttpConfig): Promise<T> {
    return api<T>('put', url, body, config)
}

export async function apiPatch<T, TBody = unknown>(url: string, body?: TBody, config?: HttpConfig): Promise<T> {
    return api<T>('patch', url, body, config)
}

export async function apiDelete<T>(url: string, config?: HttpConfig): Promise<T> {
    return api<T>('delete', url, undefined, config)
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────────────────────────────────────

export type { ApiError, ApiResponse, PaginatedResponse, ValidationErrors, HttpConfig }
export { toApiError, isApiError, http, createAbortController, resetCsrf } from './http'
