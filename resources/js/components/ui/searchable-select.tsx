"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"

export interface SelectOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    label?: string
    placeholder?: string
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
}

export function SearchableSelect({
    label,
    placeholder = "Selecione...",
    value,
    onChange,
    options,
    searchPlaceholder = "Buscar...",
    emptyMessage = "Nenhum resultado encontrado",
    disabled = false,
    className = "",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    )

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Reset highlighted index when search changes
    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch)
        setHighlightedIndex(0)
    }

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearch("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Scroll highlighted option into view
    useEffect(() => {
        if (isOpen && listRef.current) {
            const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: "nearest" })
            }
        }
    }, [highlightedIndex, isOpen])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault()
                    setIsOpen(true)
                }
                return
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setHighlightedIndex((prev) =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    )
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
                    break
                case "Enter":
                    e.preventDefault()
                    if (filteredOptions[highlightedIndex]) {
                        onChange(filteredOptions[highlightedIndex].value)
                        setIsOpen(false)
                        setSearch("")
                    }
                    break
                case "Escape":
                    e.preventDefault()
                    setIsOpen(false)
                    setSearch("")
                    break
            }
        },
        [isOpen, filteredOptions, highlightedIndex, onChange]
    )

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
        setSearch("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {label && (
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                    {label}
                </label>
            )}

            <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
                {/* Trigger Button */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        group flex w-full cursor-pointer items-center justify-between
                        rounded-2xl border-2 bg-zinc-50/50 px-6 py-2
                        text-left text-lg font-medium outline-none
                        transition-all duration-300
                        ${isOpen
                            ? "border-primary bg-white shadow-lg shadow-orange-500/5"
                            : "border-zinc-100 hover:border-zinc-200"
                        }
                        ${disabled ? "cursor-not-allowed opacity-50" : ""}
                    `}
                >
                    <span className={selectedOption ? "text-zinc-800" : "text-zinc-300"}>
                        {selectedOption?.label || placeholder}
                    </span>

                    <div className="flex items-center gap-2">
                        {value && !disabled && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                            >
                                <X size={16} />
                            </div>
                        )}
                        <ChevronDown
                            size={20}
                            className={`text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                        />
                    </div>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        className="
                            absolute z-[9999] mt-2 w-full
                            animate-in fade-in slide-in-from-top-2
                            rounded-2xl border-2 border-primary/20
                            bg-white shadow-2xl shadow-zinc-300/50
                            duration-200
                        "
                        style={{
                            maxHeight: 'calc(100vh - 200px)',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white p-3">
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="
                                        w-full rounded-xl border-2 border-zinc-100
                                        bg-zinc-50/50 py-3 pl-11 pr-4
                                        text-sm font-medium text-zinc-800
                                        outline-none transition-all duration-300
                                        placeholder:text-zinc-300
                                        focus:border-primary focus:bg-white
                                    "
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearchChange("")}
                                        className="
                                            absolute right-3 top-1/2 -translate-y-1/2
                                            rounded-full p-1 text-zinc-400
                                            transition-colors hover:bg-zinc-100 hover:text-zinc-600
                                        "
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div ref={listRef} className="p-2">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm font-medium text-zinc-400">{emptyMessage}</p>
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const isSelected = option.value === value
                                    const isHighlighted = index === highlightedIndex

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            className={`
                                                group flex w-full cursor-pointer items-center justify-between
                                                rounded-xl px-4 py-3 text-left
                                                transition-all duration-200
                                                ${isHighlighted
                                                    ? "bg-zinc-50"
                                                    : ""
                                                }
                                                ${isSelected
                                                    ? "bg-primary/5"
                                                    : ""
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    text-sm font-semibold transition-colors
                                                    ${isSelected
                                                        ? "text-primary"
                                                        : isHighlighted
                                                            ? "text-zinc-800"
                                                            : "text-zinc-600"
                                                    }
                                                `}
                                            >
                                                {option.label}
                                            </span>

                                            {isSelected && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
