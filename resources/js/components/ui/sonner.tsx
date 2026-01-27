import { Toaster as Sonner, toast as sonnerToast } from 'sonner'
import { useEffect, useState, useRef, createContext, useContext, type ReactNode } from 'react'

type ToasterProps = React.ComponentProps<typeof Sonner>

// Context para controlar o overlay
type ToastContextType = {
    triggerOverlay: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

// Provider que gerencia o estado do overlay
export function ToastProvider({ children }: { children: ReactNode }) {
    const [showOverlay, setShowOverlay] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const toastCountRef = useRef(0)

    const triggerOverlay = () => {
        toastCountRef.current += 1
        setShowOverlay(true)

        // Limpa timer anterior
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        // Novo timer - esconde após 4s do último toast
        timerRef.current = setTimeout(() => {
            setShowOverlay(false)
            toastCountRef.current = 0
        }, 4000)
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    return (
        <ToastContext.Provider value={{ triggerOverlay }}>
            {/* Overlay com blur */}
            <div
                className={`fixed inset-0 z-[9998] bg-white/70 backdrop-blur-[2px] transition-all duration-300 ${showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => {
                    setShowOverlay(false)
                    if (timerRef.current) {
                        clearTimeout(timerRef.current)
                    }
                }}
            />
            {children}
        </ToastContext.Provider>
    )
}

// Wrapper do toast que ativa o overlay
let globalTriggerOverlay: (() => void) | null = null

function Toaster({ ...props }: ToasterProps) {
    const context = useContext(ToastContext)

    useEffect(() => {
        if (context) {
            globalTriggerOverlay = context.triggerOverlay
        }
        return () => {
            globalTriggerOverlay = null
        }
    }, [context])

    return (
        <Sonner
            position="bottom-right"
            richColors
            expand={true}
            closeButton
            toastOptions={{
                classNames: {
                    toast: 'group toast bg-white text-zinc-950 border-zinc-200 shadow-2xl rounded-2xl !z-[9999]',
                    title: 'font-bold text-base',
                    description: 'text-zinc-500 text-sm',
                    actionButton: 'bg-primary text-white font-medium',
                    cancelButton: 'bg-zinc-100 text-zinc-600 font-medium',
                    error: 'bg-red-50 border-red-300 text-red-900 shadow-red-500/20',
                    success: 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-500/20',
                    warning: 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-500/20',
                    info: 'bg-blue-50 border-blue-300 text-blue-900 shadow-blue-500/20',
                },
                duration: 5000,
            }}
            {...props}
        />
    )
}

// Toast wrapper que ativa o overlay automaticamente
const toast = {
    success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
        globalTriggerOverlay?.()
        return sonnerToast.success(message, options)
    },
    error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
        globalTriggerOverlay?.()
        return sonnerToast.error(message, options)
    },
    warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
        globalTriggerOverlay?.()
        return sonnerToast.warning(message, options)
    },
    info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
        globalTriggerOverlay?.()
        return sonnerToast.info(message, options)
    },
    // Toast sem overlay
    silent: sonnerToast,
    dismiss: sonnerToast.dismiss,
}

export { Toaster, toast }
