import * as React from "react"
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select"

type BaseProps = {
    label: string
    placeholder?: string
    disabled?: boolean
    className?: string
    error?: string
}

type NativeInputProps = Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    'autoFocus' | 'inputMode' | 'maxLength' | 'minLength' | 'pattern' | 'autoComplete' | 'name' | 'id'
>

type InputProps = BaseProps & NativeInputProps & {
    as?: "input"
    type?: string
    value: string | number | undefined
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

type TextareaProps = BaseProps & {
    as: "textarea"
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    rows?: number
}

type SelectProps = BaseProps & {
    as: "select"
    value: string | undefined
    options: SelectOption[]
    onChange: (value: string) => void
    searchPlaceholder?: string
}

export type CustomFieldProps = InputProps | TextareaProps | SelectProps

export const CustomField = (props: CustomFieldProps) => {
    const baseClasses =
        "w-full rounded-2xl border-2 bg-zinc-50/50 px-6 py-2 text-md font-medium text-zinc-600 outline-none transition-all duration-300 placeholder:text-zinc-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-orange-500/5"

    const borderClass = props.error ? "border-red-500" : "border-zinc-100"

    return (
        <div className="space-y-2">
            <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                {props.label}
            </label>

            {props.as === "textarea" ? (
                <textarea
                    className={`${baseClasses} ${borderClass} min-h-[140px] resize-none ${props.className ?? ""}`}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    disabled={props.disabled}
                />
            ) : props.as === "select" ? (
                <SearchableSelect
                    label=""
                    placeholder={props.placeholder || "Selecione..."}
                    disabled={props.disabled}
                    options={props.options}
                    searchPlaceholder={props.searchPlaceholder ?? "Buscar..."}
                    value={props.value ?? ""}
                    onChange={props.onChange}
                />
            ) : (
                <input
                    className={`${baseClasses} ${borderClass} ${props.className ?? ""}`}
                    type={props.type ?? "text"}
                    placeholder={props.placeholder}
                    value={props.value ?? ""}
                    onChange={props.onChange}
                    disabled={props.disabled}
                    autoFocus={props.autoFocus}
                    inputMode={props.inputMode}
                    maxLength={props.maxLength}
                    minLength={props.minLength}
                    pattern={props.pattern}
                    autoComplete={props.autoComplete}
                    name={props.name}
                    id={props.id}
                />
            )}

            {props.error && (
                <p className="text-red-500 text-xs font-medium ml-1">{props.error}</p>
            )}
        </div>
    )
}
