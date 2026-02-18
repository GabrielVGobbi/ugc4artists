import { Check, ChevronDown, X } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { FilterOption, FilterValue, QuickFilter } from '@/types/filters'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QuickFilterSelectProps extends QuickFilter {
	/** Current value (string for single, string[] for multiple) */
	value: FilterValue
	/** Callback when value changes */
	onChange: (id: string, value: FilterValue) => void
	/** Size variant */
	size?: 'sm' | 'default'
	/** Additional CSS class */
	className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Option Item Component (memoized for performance)
// ─────────────────────────────────────────────────────────────────────────────

interface OptionItemProps {
	option: FilterOption
	isSelected: boolean
	onSelect: (value: string) => void
}

const OptionItem = memo(function OptionItem({
	option,
	isSelected,
	onSelect,
}: OptionItemProps) {
	const handleSelect = useCallback(() => {
		onSelect(option.value)
	}, [option.value, onSelect])

	return (
		<CommandItem
			value={option.value}
			onSelect={handleSelect}
			className="flex items-center gap-2"
		>
			<span
				className={cn(
					'flex size-4 items-center justify-center rounded-sm border',
					isSelected
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-muted-foreground/30'
				)}
			>
				{isSelected && <Check className="size-3" />}
			</span>
			{option.color && (
				<span
					className="size-2.5 shrink-0 rounded-full"
					style={{ backgroundColor: option.color }}
				/>
			)}
			{option.icon && (
				<option.icon className="size-4 text-muted-foreground" />
			)}
			<span className="flex-1 truncate">{option.label}</span>
			{option.count !== undefined && (
				<Badge
					variant="secondary"
					className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-xs"
				>
					{option.count}
				</Badge>
			)}
		</CommandItem>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quick filter select component for inline filtering in toolbar
 * Supports single and multiple selection with search
 */
export const QuickFilterSelect = memo(function QuickFilterSelect({
	id,
	label,
	placeholder = 'Selecionar...',
	options,
	multiple = false,
	minWidth = 150,
	clearable = true,
	icon: Icon,
	value,
	onChange,
	size = 'sm',
	className,
}: QuickFilterSelectProps) {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')

	// Normalize value to array for consistent handling
	const selectedValues = useMemo((): string[] => {
		if (!value) return []
		if (Array.isArray(value)) return value
		if (typeof value === 'string') return [value]
		return []
	}, [value])

	// Create a Set for O(1) lookup performance
	const selectedSet = useMemo(
		() => new Set(selectedValues),
		[selectedValues]
	)

	// Filter options based on search (only when popover is open)
	const filteredOptions = useMemo(() => {
		if (!open) return options
		if (!search.trim()) return options
		const searchLower = search.toLowerCase()
		return options.filter((opt) =>
			opt.label.toLowerCase().includes(searchLower)
		)
	}, [options, search, open])

	// Get selected option labels for display
	const selectedLabels = useMemo(() => {
		if (selectedValues.length === 0) return []
		return selectedValues.map(
			(v) => options.find((opt) => opt.value === v)?.label || v
		)
	}, [selectedValues, options])

	// Handle option selection
	const handleSelect = useCallback(
		(optionValue: string) => {
			if (multiple) {
				const newValues = selectedSet.has(optionValue)
					? selectedValues.filter((v) => v !== optionValue)
					: [...selectedValues, optionValue]
				onChange(id, newValues.length > 0 ? newValues : undefined)
			} else {
				const newValue = selectedSet.has(optionValue) ? undefined : optionValue
				onChange(id, newValue)
				setOpen(false)
			}
		},
		[id, multiple, selectedValues, selectedSet, onChange]
	)

	// Handle clear
	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onChange(id, undefined)
		},
		[id, onChange]
	)

	// Handle keyboard clear
	const handleKeyDownClear = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				e.stopPropagation()
				onChange(id, undefined)
			}
		},
		[id, onChange]
	)

	// Compute derived state
	const hasValue = selectedValues.length > 0
	const showSearch = options.length > 5

	// Determine button label
	const buttonLabel = useMemo(() => {
		if (selectedValues.length === 0) return placeholder
		if (selectedValues.length === 1) return selectedLabels[0]
		return `${selectedLabels[0]} +${selectedValues.length - 1}`
	}, [selectedValues.length, selectedLabels, placeholder])

	// Button classes (memoized)
	const buttonClassName = useMemo(
		() =>
			cn(
				'justify-between gap-1 font-normal',
				hasValue && 'border-primary/50 bg-primary/5',
				size === 'sm' && 'h-9 text-xs',
				className
			),
		[hasValue, size, className]
	)

	// Handle popover open change - reset search on close
	const handleOpenChange = useCallback((isOpen: boolean) => {
		setOpen(isOpen)
		if (!isOpen) {
			setSearch('')
		}
	}, [])

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size={size}
					role="combobox"
					aria-expanded={open}
					aria-label={`Filtrar por ${label}`}
					className={buttonClassName}
					style={{ minWidth }}
				>
					<span className="flex items-center gap-1.5 truncate">
						{Icon && (
							<Icon
								className={cn(
									'size-3.5 shrink-0',
									hasValue ? 'text-primary' : 'text-muted-foreground'
								)}
							/>
						)}
						<span
							className={cn(
								'truncate',
								!hasValue && 'text-muted-foreground'
							)}
						>
							{buttonLabel}
						</span>
					</span>
					<span className="flex items-center gap-0.5">
						{hasValue && clearable && (
							<span
								role="button"
								tabIndex={0}
								onClick={handleClear}
								onKeyDown={handleKeyDownClear}
								className="rounded-sm p-0.5 hover:bg-muted"
								aria-label={`Limpar filtro ${label}`}
							>
								<X className="size-3" />
							</span>
						)}
						<ChevronDown
							className={cn(
								'size-3.5 shrink-0 opacity-50',
								open && 'rotate-180'
							)}
						/>
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				style={{ minWidth: Math.max(minWidth, 200) }}
				align="start"
			>
				<Command shouldFilter={false}>
					{showSearch && (
						<CommandInput
							placeholder={`Buscar ${label.toLowerCase()}...`}
							value={search}
							onValueChange={setSearch}
							className="h-8"
						/>
					)}
					<CommandList>
						<CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
						<CommandGroup>
							{filteredOptions.map((option) => (
								<OptionItem
									key={option.value}
									option={option}
									isSelected={selectedSet.has(option.value)}
									onSelect={handleSelect}
								/>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// Quick Filters Container
// ─────────────────────────────────────────────────────────────────────────────

export interface QuickFiltersProps {
	/** Quick filter configurations */
	filters: QuickFilter[]
	/** Current filter values */
	values: Record<string, FilterValue>
	/** Callback when a filter value changes */
	onChange: (id: string, value: FilterValue) => void
	/** Size variant */
	size?: 'sm' | 'default'
	/** Additional CSS class */
	className?: string
}

/**
 * Container component to render multiple quick filters
 * Memoized to prevent unnecessary re-renders
 */
export const QuickFilters = memo(function QuickFilters({
	filters,
	values,
	onChange,
	size = 'sm',
	className,
}: QuickFiltersProps) {
	if (!filters || filters.length === 0) return null

	return (
		<div className={cn('flex items-center gap-2', className)}>
			{filters.map((filter) => (
				<QuickFilterSelect
					key={filter.id}
					{...filter}
					value={values[filter.id]}
					onChange={onChange}
					size={size}
				/>
			))}
		</div>
	)
})

export default QuickFilterSelect
