import { useCallback, useRef, useState } from 'react'
import { Check, Plus, Minus, Upload, X, Info } from 'lucide-react'
import { CustomField } from '@/components/ui/custom-field'
import { cn, formatDateForInput, formatDateFromInput, formatCPF, formatPhoneFromDigits } from '@/lib/utils'
import type { FieldConfig } from '../lib/form-config'

interface FieldRendererProps {
    field: FieldConfig
    value: unknown
    error?: string
    onChange: (value: unknown) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Field Renderer
// ─────────────────────────────────────────────────────────────────────────────

export function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
    switch (field.type) {
        case 'text':
        case 'url':
        case 'email':
            return (
                <CustomField
                    label={field.label}
                    placeholder={field.placeholder}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'cpf':
            return (
                <CustomField
                    label={field.label}
                    placeholder={field.placeholder ?? '000.000.000-00'}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(formatCPF(e.target.value))}
                    type="text"
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'phone':
            return (
                <CustomField
                    label={field.label}
                    placeholder={field.placeholder ?? '(00) 00000-0000'}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(formatPhoneFromDigits(e.target.value))}
                    type="text"
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'number':
            return (
                <CustomField
                    label={field.label}
                    placeholder={field.placeholder}
                    value={(value as number) ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    type="number"
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'money':
            return (
                <MoneyField
                    field={field}
                    value={value as number}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'textarea':
            return (
                <CustomField
                    as="textarea"
                    label={field.label}
                    placeholder={field.placeholder}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'date':
            return (
                <CustomField
                    label={field.label}
                    placeholder={field.placeholder}
                    value={value ? formatDateForInput(value as string) : ""}
                    onChange={(e) => onChange(formatDateFromInput(e.target.value))}
                    type="date"
                    disabled={field.disabled}
                    error={error}
                />

            )

        case 'select':
            return (
                <CustomField
                    as="select"
                    label={field.label}
                    placeholder={field.placeholder}
                    value={(value as string) ?? ''}
                    onChange={(val) => onChange(val)}
                    options={field.options?.map(opt => ({
                        value: String(opt.value),
                        label: opt.label,
                    })) ?? []}
                    disabled={field.disabled}
                    error={error}
                />
            )

        case 'radio':
            return (
                <RadioField
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'radio_cards':
            return (
                <RadioCardsField
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'checkbox':
            return (
                <CheckboxField
                    field={field}
                    value={value as boolean}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'multiselect_cards':
            return (
                <MultiSelectCardsField
                    field={field}
                    value={value as string[]}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'segmented':
            return (
                <SegmentedField
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'counter':
            return (
                <CounterField
                    field={field}
                    value={value as number}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'file':
            return (
                <FileUploadField
                    field={field}
                    value={value as File | string | null}
                    error={error}
                    onChange={onChange}
                />
            )

        case 'info':
            return (
                <InfoField field={field} />
            )

        default:
            return null
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Money Field
// ─────────────────────────────────────────────────────────────────────────────

function MoneyField({ field, value, error, onChange }: FieldRendererProps & { value: number }) {
    return (
        <div className="space-y-2">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-zinc-400">
                    R$
                </span>
                <input
                    type="number"
                    placeholder={field.placeholder}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
                    className={cn(
                        "w-full rounded-2xl border-2 bg-zinc-50/50 pl-14 pr-6 py-4 text-xl font-bold text-foreground outline-none transition-all",
                        "placeholder:text-zinc-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5",
                        error ? "border-red-500" : "border-zinc-100"
                    )}
                />
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
            {field.helpText && !error && (
                <p className="text-zinc-400 text-xs ml-1">{field.helpText}</p>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Radio Field
// ─────────────────────────────────────────────────────────────────────────────

function RadioField({ field, value, error, onChange }: FieldRendererProps) {
    return (
        <div className="space-y-3">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            <div className="flex flex-wrap gap-3">
                {field.options?.map((option) => (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "cursor-pointer px-6 py-4 rounded-2xl font-bold transition-all border-2",
                            value === option.value
                                ? "bg-secondary text-secondary-foreground border-secondary shadow-lg"
                                : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-primary/50"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Radio Cards Field
// ─────────────────────────────────────────────────────────────────────────────

function RadioCardsField({ field, value, error, onChange }: FieldRendererProps) {
    return (
        <div className="space-y-4">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            <div className={cn(
                "grid gap-4",
                (field.options?.length ?? 0) <= 2 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3"
            )}>
                {field.options?.map((option) => {
                    const isSelected = value === option.value
                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "cursor-pointer p-6 rounded-[2rem] border-2 text-left transition-all duration-300 relative",
                                isSelected
                                    ? "border-primary bg-white shadow-xl shadow-primary/10"
                                    : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-2">
                                    <p className="font-bold text-foreground">{option.label}</p>
                                    {option.helpText && (
                                        <p className="text-sm text-muted-foreground">{option.helpText}</p>
                                    )}
                                    {option.price !== undefined && option.price > 0 && (
                                        <p className="text-lg font-black text-primary">
                                            R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                    isSelected
                                        ? "bg-primary text-white"
                                        : "bg-zinc-100 border border-zinc-200"
                                )}>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox Field
// ─────────────────────────────────────────────────────────────────────────────

function CheckboxField({ field, value, error, onChange }: FieldRendererProps & { value: boolean }) {
    return (
        <div className="space-y-2">
            <label
                className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    value
                        ? "border-primary bg-primary/5"
                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                )}
                onClick={() => onChange(!value)}
            >
                <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0",
                    value
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-zinc-200"
                )}>
                    {value && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="flex-1">
                    <span className="font-bold text-foreground">{field.label}</span>
                    {field.helpText && (
                        <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                </div>
            </label>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiSelect Cards Field
// ─────────────────────────────────────────────────────────────────────────────

function MultiSelectCardsField({ field, value, error, onChange }: FieldRendererProps & { value: string[] }) {
    const selected = value || []

    const handleToggle = (optionValue: string) => {
        if (selected.includes(optionValue)) {
            onChange(selected.filter(v => v !== optionValue))
        } else {
            onChange([...selected, optionValue])
        }
    }

    return (
        <div className="space-y-4">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            {field.helpText && (
                <p className="text-zinc-400 text-xs ml-1">{field.helpText}</p>
            )}
            <div className="flex flex-wrap gap-3">
                {field.options?.map((option) => {
                    const isSelected = selected.includes(String(option.value))
                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => handleToggle(String(option.value))}
                            className={cn(
                                "cursor-pointer px-5 py-3 rounded-xl font-bold text-sm transition-all border-2",
                                isSelected
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-primary/50"
                            )}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Segmented Field
// ─────────────────────────────────────────────────────────────────────────────

function SegmentedField({ field, value, error, onChange }: FieldRendererProps) {
    return (
        <div className="space-y-3">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                {field.options?.map((option) => (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "cursor-pointer flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all",
                            value === option.value
                                ? "bg-white text-foreground shadow-md"
                                : "text-zinc-500 hover:text-foreground"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Counter Field
// ─────────────────────────────────────────────────────────────────────────────

function CounterField({ field, value, error, onChange }: FieldRendererProps & { value: number }) {
    const currentValue = value ?? field.min ?? 1

    const increment = () => {
        const max = field.max ?? 100
        if (currentValue < max) {
            onChange(currentValue + 1)
        }
    }

    const decrement = () => {
        const min = field.min ?? 1
        if (currentValue > min) {
            onChange(currentValue - 1)
        }
    }

    return (
        <div className="space-y-4">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>
            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={decrement}
                    className="cursor-pointer w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-2xl hover:bg-zinc-200 font-bold text-xl transition-colors flex items-center justify-center"
                >
                    <Minus size={20} />
                </button>
                <span className="text-4xl font-black tracking-tighter text-foreground min-w-[60px] text-center">
                    {currentValue}
                </span>
                <button
                    type="button"
                    onClick={increment}
                    className="cursor-pointer w-14 h-14 bg-secondary text-white rounded-2xl hover:bg-primary font-bold text-xl transition-colors flex items-center justify-center"
                >
                    <Plus size={20} />
                </button>
            </div>
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// File Upload Field
// ─────────────────────────────────────────────────────────────────────────────

function FileUploadField({ field, value, error, onChange }: FieldRendererProps & { value: File | string | null }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    // Preview derivado: URL string tem prioridade, depois preview de File
    const preview = typeof value === 'string' && value ? value : filePreview

    const handleFile = useCallback((file: File) => {
        if (field.accept && !field.accept.some(type => file.type.match(type))) {
            return
        }

        onChange(file)

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [field.accept, onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }, [handleFile])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0])
        }
    }

    const clearFile = () => {
        onChange(null)
        setFilePreview(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-3">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {field.label}
            </label>

            {preview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-100">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                    />
                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-500 transition-colors shadow-lg"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                        dragActive
                            ? "border-primary bg-primary/5"
                            : "border-zinc-200 hover:border-primary/50 bg-zinc-50"
                    )}
                >
                    <Upload size={32} className="mx-auto text-zinc-400 mb-3" />
                    <p className="font-bold text-zinc-600">Arraste ou clique para enviar</p>
                    <p className="text-sm text-zinc-400 mt-1">{field.helpText}</p>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={field.accept?.join(',')}
                onChange={handleChange}
                className="hidden"
            />

            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Info Field
// ─────────────────────────────────────────────────────────────────────────────

function InfoField({ field }: { field: FieldConfig }) {
    return (
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-3">
            <div className="flex items-start gap-3">
                <Info size={20} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                    {field.content?.map((item, i) => (
                        <p key={i} className="text-sm text-zinc-600 font-medium">{item}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}
