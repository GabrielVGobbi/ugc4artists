import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { PaginationProps } from './types'

const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 100]

/**
 * Componente de paginação para DataTable
 */
export function DataTablePagination({
    currentPage,
    lastPage,
    perPage,
    total,
    from,
    to,
    onPageChange,
    onPerPageChange,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}: PaginationProps) {
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < lastPage

    return (
        <div className="flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Info de registros */}
            <div className="text-sm text-muted-foreground">
                {total > 0 ? (
                    <>
                        Mostrando <span className="font-medium">{from}</span> a{' '}
                        <span className="font-medium">{to}</span> de{' '}
                        <span className="font-medium">{total}</span> registros
                    </>
                ) : (
                    'Nenhum registro'
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Seletor de itens por página */}
                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Por página:
                        </span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(value) => onPerPageChange(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {perPageOptions.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Navegação de páginas */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onPageChange(1)}
                        disabled={!canGoPrevious}
                        aria-label="Primeira página"
                    >
                        <ChevronsLeft className="size-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!canGoPrevious}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <span className="mx-2 text-sm">
                        Página{' '}
                        <span className="font-medium">{currentPage}</span>
                        {' '}de{' '}
                        <span className="font-medium">{lastPage || 1}</span>
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!canGoNext}
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="size-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onPageChange(lastPage)}
                        disabled={!canGoNext}
                        aria-label="Última página"
                    >
                        <ChevronsRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
