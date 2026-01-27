import axios, { AxiosError, AxiosRequestConfig } from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationErrors<T = Record<string, string>> = Partial<T>

export type ApiError<TFields extends string = string> =
    | { type: 'validation'; status: 422; errors: ValidationErrors<Record<TFields, string>> }
    | { type: 'auth'; status: 401 | 419; message: string }
    | { type: 'forbidden'; status: 403; message: string }
    | { type: 'not_found'; status: 404; message: string }
    | { type: 'server'; status: number; message: string }

export interface ApiResponse<T> {
    data: T
    message?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

function normalizeLaravelErrors(errors: unknown): Record<string, string> {
    const out: Record<string, string> = {}
    if (!errors || typeof errors !== 'object') return out

    for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
        out[key] = Array.isArray(value) ? value[0] : String(value)
    }
    return out
}

export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        'status' in error
    )
}

export function toApiError<TFields extends string = string>(err: unknown): ApiError<TFields> {
    if (isApiError(err)) return err as ApiError<TFields>

    const e = err as AxiosError<{ message?: string; errors?: unknown }>
    const status = e.response?.status ?? 0
    const data = e.response?.data

    if (status === 422) {
        return {
            type: 'validation',
            status: 422,
            errors: normalizeLaravelErrors(data?.errors) as ValidationErrors<Record<TFields, string>>,
        }
    }

    if (status === 401 || status === 419) {
        return {
            type: 'auth',
            status,
            message: status === 419
                ? 'Sessão expirada. Atualize a página e tente novamente.'
                : 'Você precisa estar logado para continuar.',
        }
    }

    if (status === 403) {
        return {
            type: 'forbidden',
            status: 403,
            message: data?.message || 'Você não tem permissão para realizar esta ação.',
        }
    }

    if (status === 404) {
        return {
            type: 'not_found',
            status: 404,
            message: data?.message || 'Recurso não encontrado.',
        }
    }

    return {
        type: 'server',
        status: status || 500,
        message: data?.message || 'Erro inesperado. Tente novamente.',
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client
// ─────────────────────────────────────────────────────────────────────────────

export const http = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
})

// CSRF handling
let csrfPromise: Promise<void> | null = null

function ensureCsrf(): Promise<void> {
    if (!csrfPromise) {
        csrfPromise = axios
            .get('/sanctum/csrf-cookie', { withCredentials: true })
            .then(() => undefined)
            .catch(() => {
                csrfPromise = null
            })
    }
    return csrfPromise!
}

export function resetCsrf(): void {
    csrfPromise = null
}

// Request interceptor - CSRF para mutations
http.interceptors.request.use(async (config) => {
    const method = (config.method ?? 'get').toLowerCase()
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        await ensureCsrf()
    }
    return config
})

// Response interceptor - tratamento global de erros
http.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Retry CSRF em caso de 419 (session expired)
        if (error.response?.status === 419 && error.config) {
            resetCsrf()
        }
        return Promise.reject(error)
    }
)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export type HttpConfig = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>

export function createAbortController(): AbortController {
    return new AbortController()
}
