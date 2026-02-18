'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import {
	format,
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	subDays,
	subWeeks,
	subMonths,
	parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	Filter,
	Search,
	X,
	Check,
	ChevronRight,
	Loader2,
	RotateCcw,
	CalendarDays,
	ChevronDown,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import type {
	AdvancedFilterPanelProps,
	DateColumn,
	DatePreset,
	FilterCategoryConfig,
	FilterChip,
	FilterOption,
	FilterValue,
} from '@/types/filters'
import { capitalize, formatDateRange } from '@/types/filters'

// ─────────────────────────────────────────────────────────────────────────────
// Default Date Presets
// ─────────────────────────────────────────────────────────────────────────────

export const defaultDatePresets: DatePreset[] = [
	{
		label: 'Hoje',
		value: 'today',
		getRange: () => ({
			from: startOfDay(new Date()),
			to: endOfDay(new Date()),
		}),
	},
	{
		label: 'Ontem',
		value: 'yesterday',
		getRange: () => {
			const yesterday = subDays(new Date(), 1)
			return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
		},
	},
	{
		label: 'Esta Semana',
		value: 'this_week',
		getRange: () => ({
			from: startOfWeek(new Date(), { weekStartsOn: 0 }),
			to: endOfWeek(new Date(), { weekStartsOn: 0 }),
		}),
	},
	{
		label: 'Semana Passada',
		value: 'last_week',
		getRange: () => {
			const lastWeek = subWeeks(new Date(), 1)
			return {
				from: startOfWeek(lastWeek, { weekStartsOn: 0 }),
				to: endOfWeek(lastWeek, { weekStartsOn: 0 }),
			}
		},
	},
	{
		label: 'Este Mês',
		value: 'this_month',
		getRange: () => ({
			from: startOfMonth(new Date()),
			to: endOfMonth(new Date()),
		}),
	},
	{
		label: 'Mês Passado',
		value: 'last_month',
		getRange: () => {
			const lastMonth = subMonths(new Date(), 1)
			return {
				from: startOfMonth(lastMonth),
				to: endOfMonth(lastMonth),
			}
		},
	},
	{
		label: 'Últimos 7 dias',
		value: 'last_7_days',
		getRange: () => ({
			from: startOfDay(subDays(new Date(), 6)),
			to: endOfDay(new Date()),
		}),
	},
	{
		label: 'Últimos 30 dias',
		value: 'last_30_days',
		getRange: () => ({
			from: startOfDay(subDays(new Date(), 29)),
			to: endOfDay(new Date()),
		}),
	},
	{
		label: 'Últimos 90 dias',
		value: 'last_90_days',
		getRange: () => ({
			from: startOfDay(subDays(new Date(), 89)),
			to: endOfDay(new Date()),
		}),
	},
]

// ─────────────────────────────────────────────────────────────────────────────
// Debounced Input Component
// ─────────────────────────────────────────────────────────────────────────────

interface DebouncedInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		'onChange' | 'size' | 'className'
	> {
	value: string
	onChange: (value: string) => void
	debounceMs?: number
	className?: string
}

function DebouncedInput({
	value: initialValue,
	onChange,
	debounceMs = 500,
	className,
	...props
}: DebouncedInputProps) {
	const [value, setValue] = useState(initialValue)
	const debouncedValue = useDebounce(value, debounceMs)
	const isFirstRender = useRef(true)

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}
		onChange(debouncedValue)
	}, [debouncedValue, onChange])

	return (
		<Input
			{...props}
			className={className}
			value={value}
			autoComplete="off"
			onChange={(e) => setValue(e.target.value)}
		/>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Async Options Hook with Caching
// ─────────────────────────────────────────────────────────────────────────────

const asyncOptionsCache = new Map<
	string,
	{ data: FilterOption[]; timestamp: number }
>()
const ASYNC_OPTIONS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function useAsyncOptions(
	apiEndpoint?: string,
	transformData?: (data: unknown) => FilterOption[],
	enabled = false
) {
	const [options, setOptions] = useState<FilterOption[]>(() => {
		if (apiEndpoint) {
			const cached = asyncOptionsCache.get(apiEndpoint)
			if (cached && Date.now() - cached.timestamp < ASYNC_OPTIONS_CACHE_TTL) {
				return cached.data
			}
		}
		return []
	})
	const [loading, setLoading] = useState(false)
	const [loaded, setLoaded] = useState(() => {
		if (apiEndpoint) {
			const cached = asyncOptionsCache.get(apiEndpoint)
			return (
				cached !== undefined &&
				Date.now() - cached.timestamp < ASYNC_OPTIONS_CACHE_TTL
			)
		}
		return false
	})

	const loadOptions = useCallback(async () => {
		if (!apiEndpoint) return

		const cached = asyncOptionsCache.get(apiEndpoint)
		if (cached && Date.now() - cached.timestamp < ASYNC_OPTIONS_CACHE_TTL) {
			setOptions(cached.data)
			setLoaded(true)
			return
		}

		setLoading(true)
		try {
			const response = await fetch(apiEndpoint)
			const data = await response.json()
			const transformed = transformData
				? transformData(data.data || data)
				: (data.data || data).map(
						(item: { id: number | string; name: string }) => ({
							label: item.name,
							value: String(item.id),
						})
					)

			asyncOptionsCache.set(apiEndpoint, {
				data: transformed,
				timestamp: Date.now(),
			})

			setOptions(transformed)
			setLoaded(true)
		} catch (error) {
			console.error('Error loading filter options:', error)
		} finally {
			setLoading(false)
		}
	}, [apiEndpoint, transformData])

	useEffect(() => {
		if (enabled && !loaded) {
			loadOptions()
		}
	}, [enabled, loaded, loadOptions])

	return { options, loading, loadOptions }
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Filter Section Component
// ─────────────────────────────────────────────────────────────────────────────

interface DateFilterSectionProps {
	columns: DateColumn[]
	presets?: DatePreset[]
	selectedColumn: string
	dateRange: { from?: Date; to?: Date }
	onColumnChange: (column: string) => void
	onPresetSelect: (preset: DatePreset) => void
	onDateRangeChange: (range: { from?: Date; to?: Date }) => void
	onClear: () => void
}

function DateFilterSection({
	columns,
	presets = defaultDatePresets,
	selectedColumn,
	dateRange,
	onColumnChange,
	onPresetSelect,
	onDateRangeChange,
	onClear,
}: DateFilterSectionProps) {
	const [showCustomRange, setShowCustomRange] = useState(false)
	const [activePreset, setActivePreset] = useState<string | null>(null)

	const handlePresetClick = (preset: DatePreset) => {
		setActivePreset(preset.value)
		setShowCustomRange(false)
		onPresetSelect(preset)
	}

	const handleCustomClick = () => {
		setActivePreset('custom')
		setShowCustomRange(true)
	}

	const hasDateFilter = dateRange.from || dateRange.to

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Select value={selectedColumn} onValueChange={onColumnChange}>
					<SelectTrigger className="h-9 w-[240px] bg-background">
						<CalendarDays className="mr-2 size-4 text-muted-foreground" />
						<SelectValue placeholder="Selecione a coluna" />
					</SelectTrigger>
					<SelectContent>
						{columns.map((col) => (
							<SelectItem key={col.value} value={col.value}>
								{col.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

{/*
				{hasDateFilter && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setActivePreset(null)
							setShowCustomRange(false)
							onClear()
						}}
						className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive"
					>
						<X className="mr-1 size-3.5" />
						Limpar
					</Button>
				)}
*/}
				{hasDateFilter && dateRange.from && dateRange.to && (
					<Badge
						variant="secondary"
						className="h-7 bg-primary/10 px-2.5 text-primary"
					>
						{format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} -{' '}
						{format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}
					</Badge>
				)}
			</div>

			<div className="flex flex-wrap gap-1.5">
				{presets.slice(0, 6).map((preset) => (
					<Button
						key={preset.value}
						variant={activePreset === preset.value ? 'default' : 'outline'}
						size="sm"
						className={cn(
							'h-7 rounded-full px-2.5 text-xs transition-all',
							activePreset === preset.value
								? 'bg-primary text-primary-foreground'
								: 'hover:border-accent-foreground/20 hover:bg-accent'
						)}
						onClick={() => handlePresetClick(preset)}
					>
						{preset.label}
					</Button>
				))}

				{presets.length > 6 && (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="h-7 rounded-full px-2.5 text-xs"
							>
								Mais
								<ChevronDown className="ml-1 size-3" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-40 p-1" align="start">
							{presets.slice(6).map((preset) => (
								<button
									key={preset.value}
									className={cn(
										'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
										activePreset === preset.value
											? 'bg-primary text-primary-foreground'
											: 'hover:bg-accent'
									)}
									onClick={() => handlePresetClick(preset)}
								>
									{preset.label}
								</button>
							))}
						</PopoverContent>
					</Popover>
				)}

				<Button
					variant={activePreset === 'custom' ? 'default' : 'outline'}
					size="sm"
					className={cn(
						'h-7 rounded-full px-2.5 text-xs transition-all',
						activePreset === 'custom'
							? 'bg-primary text-primary-foreground'
							: 'hover:border-accent-foreground/20 hover:bg-accent'
					)}
					onClick={handleCustomClick}
				>
					Personalizado
				</Button>
			</div>

			{showCustomRange && (
				<div className="grid grid-cols-2 gap-3 border-t pt-2">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							De
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'h-9 w-full justify-start text-left font-normal',
										!dateRange.from && 'text-muted-foreground'
									)}
								>
									<CalendarDays className="mr-2 size-4" />
									{dateRange.from
										? format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
										: 'Selecione'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={dateRange.from}
									onSelect={(date) =>
										onDateRangeChange({ ...dateRange, from: date })
									}
									locale={ptBR}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							Até
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'h-9 w-full justify-start text-left font-normal',
										!dateRange.to && 'text-muted-foreground'
									)}
								>
									<CalendarDays className="mr-2 size-4" />
									{dateRange.to
										? format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })
										: 'Selecione'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={dateRange.to}
									onSelect={(date) =>
										onDateRangeChange({ ...dateRange, to: date })
									}
									locale={ptBR}
									initialFocus
									disabled={(date) =>
										dateRange.from ? date < dateRange.from : false
									}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			)}
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Content Component
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryContentProps {
	category: FilterCategoryConfig
	value: FilterValue
	onChange: (value: FilterValue) => void
	isActive: boolean
	debounceMs?: number
}

function CategoryContent({
	category,
	value,
	onChange,
	isActive,
	debounceMs = 500,
}: CategoryContentProps) {
	const [search, setSearch] = useState('')
	const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

	const { options: asyncOptions, loading } = useAsyncOptions(
		category.type === 'async-select' ? category.apiEndpoint : undefined,
		category.type === 'async-select' ? category.transformData : undefined,
		isActive && category.type === 'async-select'
	)

	const options = useMemo(() => {
		if (category.type === 'async-select') return asyncOptions
		if ('options' in category) return category.options || []
		return []
	}, [category, asyncOptions])

	const filteredOptions = useMemo(() => {
		if (!search.trim()) return options
		return options.filter((opt) =>
			opt.label.toLowerCase().includes(search.toLowerCase())
		)
	}, [options, search])

	const toggleMultiSelect = useCallback(
		(optValue: string) => {
			const currentValues = Array.isArray(value) ? value : []
			const newValues = currentValues.includes(optValue)
				? currentValues.filter((v) => v !== optValue)
				: [...currentValues, optValue]
			onChange(newValues.length > 0 ? newValues : undefined)
		},
		[value, onChange]
	)

	const isSelected = useCallback(
		(optValue: string) => {
			if (category.type === 'multi-select' || category.type === 'async-select') {
				return Array.isArray(value) && value.includes(optValue)
			}
			return value === optValue
		},
		[category.type, value]
	)

	const handleTextChange = useCallback(
		(newValue: string) => {
			onChange(newValue || undefined)
		},
		[onChange]
	)

	// Text filter
	if (category.type === 'text') {
		return (
			<div className="p-1">
				<DebouncedInput
					placeholder={
						category.placeholder ||
						`Filtrar por ${category.title.toLowerCase()}...`
					}
					value={(value as string) || ''}
					onChange={handleTextChange}
					debounceMs={debounceMs}
					className="h-9"
					autoFocus
				/>
			</div>
		)
	}

	// Date filter
	if (category.type === 'date') {
		return (
			<div className="p-2">
				<Calendar
					mode="single"
					selected={value ? new Date(value as string) : undefined}
					onSelect={(date) =>
						onChange(date ? format(date, 'yyyy-MM-dd') : undefined)
					}
					locale={ptBR}
					className="rounded-md border-0"
				/>
			</div>
		)
	}

	// Date range filter
	if (category.type === 'date-range') {
		return (
			<div className="space-y-3 p-2">
				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							De
						</label>
						<Calendar
							mode="single"
							selected={dateRange.from}
							onSelect={(date) => {
								const newRange = { ...dateRange, from: date }
								setDateRange(newRange)
								if (newRange.from && newRange.to) {
									onChange({
										from: format(newRange.from, 'yyyy-MM-dd'),
										to: format(newRange.to, 'yyyy-MM-dd'),
									})
								}
							}}
							locale={ptBR}
							className="rounded-md border p-2"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Até
						</label>
						<Calendar
							mode="single"
							selected={dateRange.to}
							onSelect={(date) => {
								const newRange = { ...dateRange, to: date }
								setDateRange(newRange)
								if (newRange.from && newRange.to) {
									onChange({
										from: format(newRange.from, 'yyyy-MM-dd'),
										to: format(newRange.to, 'yyyy-MM-dd'),
									})
								}
							}}
							locale={ptBR}
							className="rounded-md border p-2"
						/>
					</div>
				</div>
			</div>
		)
	}

	// Select / Multi-select / Async-select
	return (
		<div className="space-y-2">
			{category.searchable !== false && options.length > 5 && (
				<div className="px-1 pb-1">
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={`Buscar ${category.title.toLowerCase()}...`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-8 pl-8 text-sm"
						/>
					</div>
				</div>
			)}

			{loading && (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="size-5 animate-spin text-muted-foreground" />
				</div>
			)}

			{!loading && (
				<ScrollArea className="max-h-[280px]">
					<div className="grid grid-cols-2 gap-1.5 p-1">
						{filteredOptions.map((opt) => (
							<label
								key={opt.value}
								className={cn(
									'flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-all duration-200',
									'hover:border-accent-foreground/20 hover:bg-accent/50',
									isSelected(opt.value) &&
										'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
								)}
							>
								{category.type === 'multi-select' ||
								category.type === 'async-select' ? (
									<Checkbox
										checked={isSelected(opt.value)}
										onCheckedChange={() => toggleMultiSelect(opt.value)}
										className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
									/>
								) : (
									<div
										className={cn(
											'flex size-4 items-center justify-center rounded-full border-2 transition-colors',
											isSelected(opt.value)
												? 'border-primary bg-primary'
												: 'border-muted-foreground/30'
										)}
										onClick={() =>
											onChange(value === opt.value ? undefined : opt.value)
										}
									>
										{isSelected(opt.value) && (
											<Check className="size-2.5 text-primary-foreground" />
										)}
									</div>
								)}

								{opt.color && (
									<span
										className="size-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: opt.color }}
									/>
								)}

								{opt.icon && (
									<opt.icon className="size-4 shrink-0 text-muted-foreground" />
								)}

								<span className="flex-1 truncate text-sm">{opt.label}</span>

								{opt.count !== undefined && (
									<span className="tabular-nums text-xs text-muted-foreground">
										{String(opt.count)}
									</span>
								)}
							</label>
						))}
					</div>

					{filteredOptions.length === 0 && !loading && (
						<div className="py-8 text-center text-sm text-muted-foreground">
							Nenhuma opção encontrada
						</div>
					)}
				</ScrollArea>
			)}
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// AdvancedFilterPanel Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdvancedFilterPanel({
	categories,
	values,
	onChange,
	onReset,
	onApply,
	triggerLabel = 'Filtros',
	triggerVariant = 'outline',
	align = 'start',
	width = 680,
	showActiveFilters = true,
	showApplyButton = false,
	showGlobalSearch = true,
	globalSearchPlaceholder = 'Buscar...',
	globalSearchWidth = 280,
	debounceMs = 500,
	className,
	showDateFilter = false,
	dateFilterColumns = [],
	dateFilterPresets = defaultDatePresets,
	defaultDateColumn,
}: AdvancedFilterPanelProps) {
	const [open, setOpen] = useState(false)
	const [activeCategory, setActiveCategory] = useState<string>(
		categories[0]?.id || ''
	)
	const [categorySearch, setCategorySearch] = useState('')

	// Date filter state
	const [selectedDateColumn, setSelectedDateColumn] = useState<string>(
		defaultDateColumn || dateFilterColumns[0]?.value || ''
	)
	const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

	// Handle global search change
	const handleGlobalSearchChange = useCallback(
		(value: string) => {
			onChange('search', value || undefined)
		},
		[onChange]
	)

	// Handle date filter column change
	const handleDateColumnChange = useCallback(
		(column: string) => {
			if (selectedDateColumn) {
				onChange(`${selectedDateColumn}_from`, undefined)
				onChange(`${selectedDateColumn}_to`, undefined)
			}
			setSelectedDateColumn(column)
			if (dateRange.from && dateRange.to) {
				onChange(`${column}_from`, format(dateRange.from, 'yyyy-MM-dd'))
				onChange(`${column}_to`, format(dateRange.to, 'yyyy-MM-dd'))
			}
		},
		[selectedDateColumn, dateRange, onChange]
	)

	// Handle date preset selection
	const handleDatePresetSelect = useCallback(
		(preset: DatePreset) => {
			const range = preset.getRange()
			setDateRange(range)
			if (selectedDateColumn) {
				onChange(`${selectedDateColumn}_from`, format(range.from, 'yyyy-MM-dd'))
				onChange(`${selectedDateColumn}_to`, format(range.to, 'yyyy-MM-dd'))
			}
		},
		[selectedDateColumn, onChange]
	)

	// Handle custom date range change
	const handleDateRangeChange = useCallback(
		(range: { from?: Date; to?: Date }) => {
			setDateRange(range)
			if (selectedDateColumn) {
				if (range.from) {
					onChange(
						`${selectedDateColumn}_from`,
						format(range.from, 'yyyy-MM-dd')
					)
				} else {
					onChange(`${selectedDateColumn}_from`, undefined)
				}
				if (range.to) {
					onChange(`${selectedDateColumn}_to`, format(range.to, 'yyyy-MM-dd'))
				} else {
					onChange(`${selectedDateColumn}_to`, undefined)
				}
			}
		},
		[selectedDateColumn, onChange]
	)

	// Handle clear date filter
	const handleClearDateFilter = useCallback(() => {
		setDateRange({})
		if (selectedDateColumn) {
			onChange(`${selectedDateColumn}_from`, undefined)
			onChange(`${selectedDateColumn}_to`, undefined)
		}
	}, [selectedDateColumn, onChange])

	// Count active filters
	const activeFiltersCount = useMemo(() => {
		let count = 0

		Object.entries(values).forEach(([key, value]) => {
			if (value === undefined || value === null || value === '') return
			if (Array.isArray(value) && value.length === 0) return

			if (key === 'search') {
				count++
				return
			}

			if (key.endsWith('_to')) return

			if (key.endsWith('_from')) {
				count++
				return
			}

			if (Array.isArray(value)) {
				count += value.length
			} else {
				count++
			}
		})

		return count
	}, [values])

	// Get active filter chips
	const activeChips = useMemo(() => {
		const chips: FilterChip[] = []

		// Add search chip
		if (values.search) {
			chips.push({
				categoryId: 'search',
				categoryTitle: 'Busca',
				value: 'search',
				label: String(values.search),
				type: 'search',
			})
		}

		// Add date filter chips
		const dateFromKeys = Object.keys(values).filter(
			(k) => k.endsWith('_from') && values[k]
		)
		dateFromKeys.forEach((fromKey) => {
			const column = fromKey.replace('_from', '')
			const toKey = `${column}_to`
			const fromValue = values[fromKey]
			const toValue = values[toKey]

			if (fromValue || toValue) {
				const columnConfig = dateFilterColumns?.find((c) => c.value === column)
				const columnLabel = columnConfig?.label || column

				let dateLabel = ''
				if (fromValue && toValue) {
					const fromDate = parseISO(fromValue as string)
					const toDate = parseISO(toValue as string)
					dateLabel = `${format(fromDate, 'dd/MM/yy', { locale: ptBR })} - ${format(toDate, 'dd/MM/yy', { locale: ptBR })}`
				} else if (fromValue) {
					const fromDate = parseISO(fromValue as string)
					dateLabel = `A partir de ${format(fromDate, 'dd/MM/yy', { locale: ptBR })}`
				} else if (toValue) {
					const toDate = parseISO(toValue as string)
					dateLabel = `Até ${format(toDate, 'dd/MM/yy', { locale: ptBR })}`
				}

				chips.push({
					categoryId: fromKey,
					categoryTitle: columnLabel,
					value: `${column}_date`,
					label: dateLabel,
					type: 'date',
				})
			}
		})

		// Add category filter chips
		Object.entries(values).forEach(([categoryId, value]) => {
			if (value === undefined || value === null || value === '') return
			if (categoryId === 'search') return
			if (categoryId.endsWith('_from') || categoryId.endsWith('_to')) return

			const category = categories.find((c) => c.id === categoryId)
			if (!category) return

			if (Array.isArray(value)) {
				value.forEach((v) => {
					let optionLabel = v
					if ('options' in category && category.options) {
						const option = category.options.find((o) => o.value === v)
						optionLabel = option?.label || v
					}
					chips.push({
						categoryId,
						categoryTitle: category.title,
						value: v,
						label: optionLabel,
					})
				})
			} else if (typeof value === 'object' && 'from' in value) {
				const dateValue = value as { from: string; to: string }
				chips.push({
					categoryId,
					categoryTitle: category.title,
					value: `${dateValue.from}_${dateValue.to}`,
					label: `${dateValue.from} - ${dateValue.to}`,
					type: 'date',
				})
			} else {
				let label = String(value)
				if ('options' in category && category.options) {
					const option = category.options.find((o) => o.value === value)
					label = option?.label || String(value)
				}
				chips.push({
					categoryId,
					categoryTitle: category.title,
					value: String(value),
					label,
				})
			}
		})

		return chips
	}, [values, categories, dateFilterColumns])

	// Filter categories by search
	const filteredCategories = useMemo(() => {
		if (!categorySearch.trim()) return categories
		return categories.filter((c) =>
			c.title.toLowerCase().includes(categorySearch.toLowerCase())
		)
	}, [categories, categorySearch])

	// Handle removing a chip
	const handleRemoveChip = useCallback(
		(chip: FilterChip) => {
			if (chip.categoryId === 'search') {
				onChange('search', undefined)
				return
			}

			if (chip.categoryId.endsWith('_from')) {
				const column = chip.categoryId.replace('_from', '')
				onChange(`${column}_from`, undefined)
				onChange(`${column}_to`, undefined)
				setDateRange({})
				return
			}

			const category = categories.find((c) => c.id === chip.categoryId)
			if (!category) return

			const currentValue = values[chip.categoryId]

			if (Array.isArray(currentValue)) {
				const newValue = currentValue.filter((v) => v !== chip.value)
				onChange(chip.categoryId, newValue.length > 0 ? newValue : undefined)
			} else {
				onChange(chip.categoryId, undefined)
			}
		},
		[categories, values, onChange]
	)

	// Handle apply
	const handleApply = useCallback(() => {
		onApply?.()
		setOpen(false)
	}, [onApply])

	// Handle clear all
	const handleClearAll = useCallback(() => {
		setDateRange({})
		onReset()
	}, [onReset])

	const activeCategoryData = categories.find((c) => c.id === activeCategory)

	return (
		<div className={cn('flex flex-wrap items-center gap-2', className)}>
			{/* Global Search */}
			{showGlobalSearch && (
				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<DebouncedInput
						placeholder={globalSearchPlaceholder}
						value={String(values.search || '')}
						onChange={handleGlobalSearchChange}
						debounceMs={debounceMs}
						className="h-9 rounded-lg border-border/50 bg-background pl-9 pr-8 text-sm"
						style={{ width: globalSearchWidth }}
					/>
					{Boolean(values.search) && (
						<button
							onClick={() => onChange('search', undefined)}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
						>
							<X className="size-4" />
						</button>
					)}
				</div>
			)}

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={triggerVariant}
						size="sm"
						className={cn(
							'h-9 gap-2 rounded-lg px-3 transition-all',
							activeFiltersCount > 0 && 'border-primary/50 bg-primary/5'
						)}
					>
						<Filter className="size-4" />
						{triggerLabel}
						{activeFiltersCount > 0 && (
							<Badge
								variant="secondary"
								className="ml-1 h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
							>
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align={align}
					className="rounded-xl border-border/50 p-0 shadow-xl"
					style={{ width }}
				>
					{/* Header */}
					<div className="border-b bg-muted/30">
						<div className="flex items-center justify-between px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold">Filtros</span>
							</div>
							{activeFiltersCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearAll}
									className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
								>
									<RotateCcw className="mr-1 size-3" />
									Limpar tudo
								</Button>
							)}
						</div>

						{/* Date Filter Section */}
						{showDateFilter && dateFilterColumns.length > 0 && (
							<div className="border-t border-border/30 px-4 pb-3 pt-3">
								<DateFilterSection
									columns={dateFilterColumns}
									presets={dateFilterPresets}
									selectedColumn={selectedDateColumn}
									dateRange={dateRange}
									onColumnChange={handleDateColumnChange}
									onPresetSelect={handleDatePresetSelect}
									onDateRangeChange={handleDateRangeChange}
									onClear={handleClearDateFilter}
								/>
							</div>
						)}
					</div>

					{/* Content */}
					<div
						className="grid grid-cols-[220px_1fr]"
						style={{ minHeight: 320 }}
					>
						{/* Categories sidebar */}
						<div className="border-r bg-muted/20 p-2">
							{categories.length > 6 && (
								<div className="px-1 pb-2">
									<Input
										placeholder="Buscar categoria..."
										value={categorySearch}
										onChange={(e) => setCategorySearch(e.target.value)}
										className="h-8 text-sm"
									/>
								</div>
							)}

							<ScrollArea className="h-[280px]">
								<div className="space-y-0.5">
									{filteredCategories.map((cat) => {
										const hasValue =
											values[cat.id] !== undefined && values[cat.id] !== ''
										const valueCount = Array.isArray(values[cat.id])
											? (values[cat.id] as unknown[]).length
											: hasValue
												? 1
												: 0

										return (
											<button
												key={cat.id}
												className={cn(
													'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all',
													'hover:bg-accent/80',
													activeCategory === cat.id
														? 'bg-accent font-medium text-accent-foreground'
														: 'text-muted-foreground'
												)}
												onClick={() => setActiveCategory(cat.id)}
											>
												{cat.icon && (
													<cat.icon
														className={cn(
															'size-4 shrink-0',
															activeCategory === cat.id
																? 'text-primary'
																: 'text-muted-foreground'
														)}
													/>
												)}
												<span className="flex-1 truncate text-left">
													{cat.title}
												</span>
												{valueCount > 0 && (
													<Badge
														variant="secondary"
														className="h-5 min-w-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary"
													>
														{valueCount}
													</Badge>
												)}
												<ChevronRight
													className={cn(
														'size-4 shrink-0 transition-transform',
														activeCategory === cat.id && 'rotate-90'
													)}
												/>
											</button>
										)
									})}
								</div>
							</ScrollArea>
						</div>

						{/* Category content */}
						<div className="p-3">
							{activeCategoryData && (
								<>
									<div className="mb-3">
										<h4 className="text-sm font-medium">
											{activeCategoryData.title}
										</h4>
									</div>
									<CategoryContent
										category={activeCategoryData}
										value={values[activeCategoryData.id]}
										onChange={(value) => onChange(activeCategoryData.id, value)}
										isActive={activeCategory === activeCategoryData.id}
										debounceMs={debounceMs}
									/>
								</>
							)}
						</div>
					</div>

					{/* Footer */}
					{showApplyButton && (
						<>
							<Separator />
							<div className="flex items-center justify-end gap-2 bg-muted/20 px-4 py-3">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setOpen(false)}
								>
									Cancelar
								</Button>
								<Button size="sm" onClick={handleApply} className="px-6">
									Aplicar Filtros
								</Button>
							</div>
						</>
					)}
				</PopoverContent>
			</Popover>

			{/* Active filter chips */}
			{showActiveFilters && activeChips.length > 0 && (
				<div className="flex flex-wrap items-center gap-1.5">
					{activeChips.slice(0, 5).map((chip, index) => {
						const isSearchChip = chip.type === 'search'
						const isDateChip = chip.type === 'date'

						return (
							<Badge
								key={`${chip.categoryId}-${chip.value}-${index}`}
								variant="secondary"
								className={cn(
									'h-8 gap-1.5 pl-2.5 pr-1.5 transition-colors',
									isSearchChip &&
										'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
									isDateChip &&
										'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
									!isSearchChip &&
										!isDateChip &&
										'bg-primary/10 text-primary hover:bg-primary/20'
								)}
							>
								{isSearchChip && <Search className="size-3" />}
								{isDateChip && <CalendarDays className="size-3" />}
								<span className="text-xs font-medium">
									{chip.categoryTitle}:
								</span>
								<span className="max-w-[120px] truncate text-xs">
									{chip.label}
								</span>
								<button
									onClick={() => handleRemoveChip(chip)}
									className={cn(
										'ml-0.5 rounded-full p-0.5 transition-colors',
										isSearchChip && 'hover:bg-blue-300/50',
										isDateChip && 'hover:bg-amber-300/50',
										!isSearchChip && !isDateChip && 'hover:bg-primary/20'
									)}
								>
									<X className="size-3" />
								</button>
							</Badge>
						)
					})}
					{activeChips.length > 5 && (
						<Badge variant="outline" className="h-7 rounded-full text-xs">
							+{activeChips.length - 5} mais
						</Badge>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearAll}
						className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
					>
						Limpar
					</Button>
				</div>
			)}
		</div>
	)
}

export default AdvancedFilterPanel
