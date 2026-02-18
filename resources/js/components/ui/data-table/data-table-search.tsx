import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DataTableSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    debounceMs?: number
    className?: string
}

/**
 * Campo de busca com debounce para DataTable
 */
export function DataTableSearch({
    value,
    onChange,
    placeholder = 'Buscar...',
    debounceMs = 300,
    className,
}: DataTableSearchProps) {
    const [localValue, setLocalValue] = useState(value)

    // Sincroniza valor externo
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Debounce da busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue)
            }
        }, debounceMs)

        return () => clearTimeout(timer)
    }, [localValue, debounceMs, onChange, value])

    const handleClear = () => {
        setLocalValue('')
        onChange('')
    }

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-9"
                aria-label={placeholder}
            />

            {localValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                    onClick={handleClear}
                    aria-label="Limpar busca"
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    )
}
