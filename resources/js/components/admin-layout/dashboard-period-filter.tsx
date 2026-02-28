import { useState } from 'react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, ChevronDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { DashboardFilters, DashboardPeriod } from '@/lib/api/dashboard'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PeriodOption {
    value: DashboardPeriod
    label: string
}

const PERIOD_OPTIONS: PeriodOption[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'custom', label: 'Período' },
]

interface DashboardPeriodFilterProps {
    filters: DashboardFilters
    onChange: (filters: DashboardFilters) => void
    isFetching?: boolean
    onRefresh?: () => void
    lastUpdated?: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardPeriodFilter({
    filters,
    onChange,
    isFetching,
    onRefresh,
    lastUpdated,
}: DashboardPeriodFilterProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: filters.date_from ? new Date(filters.date_from) : undefined,
        to: filters.date_to ? new Date(filters.date_to) : undefined,
    })

    const handlePeriodChange = (period: DashboardPeriod) => {
        if (period === 'custom') {
            setIsCalendarOpen(true)
            return
        }
        onChange({ period })
    }

    const handleRangeApply = () => {
        if (!dateRange.from) return
        onChange({
            period: 'custom',
            date_from: format(dateRange.from, 'yyyy-MM-dd'),
            date_to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd'),
        })
        setIsCalendarOpen(false)
    }

    const parseLocalDate = (dateStr: string) =>
        parse(dateStr, 'yyyy-MM-dd', new Date())

    const getCustomLabel = () => {
        if (filters.period !== 'custom') return 'Período'
        const from = filters.date_from ? format(parseLocalDate(filters.date_from), 'dd/MM', { locale: ptBR }) : ''
        const to = filters.date_to ? format(parseLocalDate(filters.date_to), 'dd/MM', { locale: ptBR }) : ''
        if (from && to && from !== to) return `${from} – ${to}`
        if (from) return from
        return 'Período'
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Period Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm">
                {PERIOD_OPTIONS.map((option) => {
                    const isActive = filters.period === option.value
                    const isCustom = option.value === 'custom'

                    if (isCustom) {
                        return (
                            <Popover key={option.value} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => handlePeriodChange('custom')}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {getCustomLabel()}
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                                    <div className="p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Selecione o período
                                        </p>
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onRangeSelect={setDateRange}
                                            maxDate={new Date()}
                                        />
                                        <div className="mt-3 flex gap-2 border-t pt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setIsCalendarOpen(false)}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={handleRangeApply}
                                                disabled={!dateRange.from}
                                            >
                                                Aplicar
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handlePeriodChange(option.value)}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>

            {/* Refresh + Last Updated */}
            <div className="flex items-center gap-3">
                {lastUpdated && (
                    <span className="text-xs text-muted-foreground">
                        Atualizado{' '}
                        {format(lastUpdated, "HH:mm'h'", { locale: ptBR })}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
                    <span className="hidden sm:inline">Atualizar</span>
                </Button>
            </div>
        </div>
    )
}
