import * as React from 'react'
import { cn } from '@/lib/utils'

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number
    onChange: (value: number) => void
    label?: string
    error?: string
}

export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function parseCurrencyToNumber(value: string): number {
    const digits = value.replace(/\D/g, '')
    if (!digits) return 0
    return parseInt(digits, 10) / 100
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, value, onChange, label, error, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState(() => formatCurrency(value))

        React.useEffect(() => {
            setDisplayValue(formatCurrency(value))
        }, [value])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value
            const numericValue = parseCurrencyToNumber(rawValue)

            setDisplayValue(formatCurrency(numericValue))
            onChange(numericValue)
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // Permite: backspace, delete, tab, escape, enter, setas
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

            if (allowedKeys.includes(e.key)) {
                return
            }

            // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if (e.ctrlKey || e.metaKey) {
                return
            }

            // Bloqueia tudo que não for número
            if (!/^\d$/.test(e.key)) {
                e.preventDefault()
            }
        }

        return (
            <div className="space-y-2">
                {label && (
                    <label className="ml-1 text-[0.8em] font-black tracking-[0.1em] text-zinc-600">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-zinc-400">
                        R$
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        ref={ref}
                        value={displayValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            'bg-white border-2 border-zinc-100 rounded-2xl pl-16 pr-6 py-2 font-black text-2xl outline-none focus:border-primary transition-all w-full',
                            error && 'border-red-500 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            </div>
        )
    }
)

MoneyInput.displayName = 'MoneyInput'

export { MoneyInput }
