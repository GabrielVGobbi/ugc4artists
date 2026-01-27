import { useCallback, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import type { ApiError, ValidationErrors } from '@/lib/api'
import { isApiError } from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FieldErrors<T> = Partial<Record<keyof T, string>>

interface MutationOptions<TForm, TResult> {
    onSuccess?: (result: TResult, payload: TForm) => void | Promise<void>
    onError?: (error: ApiError, payload: TForm) => void
    onSettled?: (payload: TForm) => void
    reloadOnSuccess?: boolean | string[]
    resetOnSuccess?: boolean
}

interface MutationState<TForm> {
    processing: boolean
    errors: FieldErrors<TForm>
    formError: string | null
}

interface MutationReturn<TForm, TResult> extends MutationState<TForm> {
    mutate: (payload: TForm, options?: MutationOptions<TForm, TResult>) => Promise<TResult | undefined>
    mutateAsync: (payload: TForm) => Promise<TResult>
    reset: () => void
    clear: () => void // alias for reset (backwards compatibility)
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors<TForm>>>
    setFormError: React.Dispatch<React.SetStateAction<string | null>>
    setFieldError: (field: keyof TForm, message: string) => void
    clearFieldError: (field: keyof TForm) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useApiMutation<TForm extends object, TResult = unknown>(
    mutationFn: (payload: TForm) => Promise<TResult>,
    defaultOptions?: MutationOptions<TForm, TResult>
): MutationReturn<TForm, TResult> {
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<FieldErrors<TForm>>({})
    const [formError, setFormError] = useState<string | null>(null)

    const optionsRef = useRef(defaultOptions)
    optionsRef.current = defaultOptions

    const reset = useCallback(() => {
        setErrors({})
        setFormError(null)
        setProcessing(false)
    }, [])

    const setFieldError = useCallback((field: keyof TForm, message: string) => {
        setErrors((prev) => ({ ...prev, [field]: message }))
    }, [])

    const clearFieldError = useCallback((field: keyof TForm) => {
        setErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }, [])

    const mutateAsync = useCallback(
        async (payload: TForm): Promise<TResult> => {
            setProcessing(true)
            setErrors({})
            setFormError(null)

            try {
                return await mutationFn(payload)
            } finally {
                setProcessing(false)
            }
        },
        [mutationFn]
    )

    const mutate = useCallback(
        async (
            payload: TForm,
            options?: MutationOptions<TForm, TResult>
        ): Promise<TResult | undefined> => {
            const opts = { ...optionsRef.current, ...options }

            setProcessing(true)
            setErrors({})
            setFormError(null)

            try {
                const result = await mutationFn(payload)

                if (opts.reloadOnSuccess) {
                    const only = Array.isArray(opts.reloadOnSuccess)
                        ? opts.reloadOnSuccess
                        : undefined
                    router.reload({ only })
                }

                if (opts.resetOnSuccess) {
                    reset()
                }

                await opts.onSuccess?.(result, payload)
                opts.onSettled?.(payload)

                setProcessing(false)
                return result
            } catch (e) {
                const error = isApiError(e) ? e : { type: 'server' as const, status: 500, message: 'Erro inesperado' }

                if (error.type === 'validation') {
                    setErrors(error.errors as FieldErrors<TForm>)
                } else {
                    setFormError(error.message)
                }

                opts.onError?.(error as ApiError, payload)
                opts.onSettled?.(payload)

                setProcessing(false)
                return undefined
            }
        },
        [mutationFn, reset]
    )

    return {
        mutate,
        mutateAsync,
        processing,
        errors,
        formError,
        reset,
        clear: reset, // alias for backwards compatibility
        setErrors,
        setFormError,
        setFieldError,
        clearFieldError,
    }
}
