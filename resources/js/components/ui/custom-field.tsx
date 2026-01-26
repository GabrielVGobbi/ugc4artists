import * as React from "react"
import { SearchableSelect } from "@/components/ui/searchable-select"

type Option = { label: string; value: string | number }

type BaseProps = {
    label: string
    placeholder?: string
    disabled?: boolean
    className?: string
}

type InputProps = BaseProps & {
    as?: "input"
    type?: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

type TextareaProps = BaseProps & {
    as: "textarea"
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

type SelectProps = BaseProps & {
    as: "select"
    value?: string | number
    options: Option[]
    onChange: (value: string | number) => void
    searchPlaceholder?: string
}

export type CustomFieldProps = InputProps | TextareaProps | SelectProps

export const CustomField = (props: CustomFieldProps) => {
    const baseClasses =
        "w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 px-6 py-2 text-lg font-medium text-zinc-600 outline-none transition-all duration-300 placeholder:text-zinc-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-orange-500/5"

    return (
        <div className="space-y-3">
            <label className="ml-1 text-[0.7rem] font-black tracking-[0.1em] uppercase text-zinc-700">
                {props.label}
            </label>

            {props.as === "textarea" ? (
                <textarea
                    className={`${baseClasses} min-h-[140px] resize-none ${props.className ?? ""}`}
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
                    value={props.value}
                    onChange={(val: string | number) => props.onChange(val)}
                />
            ) : (
                <input
                    className={`${baseClasses} ${props.className ?? ""}`}
                    type={props.type ?? "text"}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    disabled={props.disabled}
                />
            )}
        </div>
    )
}
