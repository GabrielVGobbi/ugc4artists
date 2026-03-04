import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2, Search, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { httpGet } from '@/lib/http'
import { cn } from '@/lib/utils'
import type { CreatorOption, CreatorsPaginatedResponse } from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CREATORS_ENDPOINT = '/api/v1/admin/campaigns/creators'
const PER_PAGE = 20
const SEARCH_DEBOUNCE_MS = 400

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name: string): string => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SelectCreatorsModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (creatorIds: number[]) => void
    initialSelectedIds?: number[]
    maxSelections?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Infinite scroll sentinel
// ─────────────────────────────────────────────────────────────────────────────

interface SentinelProps {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    onIntersect: () => void
}

function InfiniteScrollSentinel({ hasNextPage, isFetchingNextPage, onIntersect }: SentinelProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el || !hasNextPage) return

        // Find Radix ScrollArea viewport as the root so the observer fires
        // relative to the modal's scroll container, not the window.
        let scrollRoot: Element | null = el.parentElement
        while (scrollRoot && !scrollRoot.hasAttribute('data-radix-scroll-area-viewport')) {
            scrollRoot = scrollRoot.parentElement
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    onIntersect()
                }
            },
            { root: scrollRoot ?? null, threshold: 0.1 },
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, onIntersect])

    if (!hasNextPage && !isFetchingNextPage) return null

    return (
        <div ref={ref} className="flex items-center justify-center py-4">
            {isFetchingNextPage && (
                <Loader2 className="size-4 animate-spin text-zinc-400" />
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal for selecting creators to send a campaign to.
 *
 * Uses `useInfiniteQuery` for paginated creator listing with server-side search.
 * An `IntersectionObserver` sentinel at the list bottom triggers `fetchNextPage`.
 * Search input is debounced 400ms — each new query resets to page 1.
 */
export function SelectCreatorsModal({
    open,
    onClose,
    onConfirm,
    initialSelectedIds = [],
    maxSelections,
}: SelectCreatorsModalProps) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(
        new Set(initialSelectedIds),
    )
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setSelectedIds(new Set(initialSelectedIds))
            setSearch('')
            setDebouncedSearch('')
        }
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [search])

    // ── Infinite query ────────────────────────────────────────────────

    const query = useInfiniteQuery({
        queryKey: ['admin-creators', debouncedSearch],
        queryFn: ({ pageParam }) =>
            httpGet<CreatorsPaginatedResponse>(CREATORS_ENDPOINT, {
                params: {
                    search: debouncedSearch || undefined,
                    page: pageParam,
                    per_page: PER_PAGE,
                },
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.meta
            return current_page < last_page ? current_page + 1 : undefined
        },
        enabled: open,
        staleTime: 60_000,
    })

    const creators = useMemo(
        () => query.data?.pages.flatMap((p) => p.data) ?? [],
        [query.data],
    )

    const totalCount = query.data?.pages[0]?.meta.total ?? 0

    const handleFetchNextPage = useCallback(() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage()
        }
    }, [query])

    // ── Selection handlers ────────────────────────────────────────────

    const handleToggle = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                if (maxSelections && next.size >= maxSelections) {
                    toast.error(
                        `Máximo de ${maxSelections} creator${maxSelections > 1 ? 's' : ''} para esta campanha.`,
                    )
                    return prev
                }
                next.add(id)
            }
            return next
        })
    }, [maxSelections])

    const handleConfirm = useCallback(() => {
        if (selectedIds.size === 0) {
            toast.error('Selecione pelo menos um creator.')
            return
        }
        if (maxSelections && selectedIds.size > maxSelections) {
            toast.error(`Limite é ${maxSelections} creator${maxSelections > 1 ? 's' : ''}.`)
            return
        }
        onConfirm(Array.from(selectedIds))
        onClose()
    }, [selectedIds, maxSelections, onConfirm, onClose])

    const handleClose = useCallback(() => {
        setSearch('')
        setSelectedIds(new Set())
        onClose()
    }, [onClose])

    const selectedCount = selectedIds.size
    const isLoading = query.isLoading

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecionar Creators</DialogTitle>
                    <DialogDescription>
                        Selecione os creators que receberão esta campanha.
                        {maxSelections && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium text-xs">
                                Limite: {maxSelections} creator{maxSelections > 1 ? 's' : ''}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                        aria-label="Buscar creators"
                    />
                </div>

                {/* Counter bar */}
                <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs text-zinc-500">
                        {isLoading ? (
                            <Skeleton className="h-3 w-24 inline-block" />
                        ) : (
                            `${creators.length} de ${totalCount} carregados`
                        )}
                    </span>
                    <Badge
                        variant={
                            maxSelections && selectedCount >= maxSelections
                                ? 'destructive'
                                : 'default'
                        }
                    >
                        {selectedCount}
                        {maxSelections ? ` / ${maxSelections}` : ''} selecionado
                        {selectedCount !== 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* Creators list */}
                <ScrollArea className="h-[400px] pr-4">
                    {isLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={`skeleton-${i}`}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <Skeleton className="size-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-52" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && creators.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                <UserIcon className="size-5 text-zinc-400" />
                            </div>
                            <p className="text-sm text-zinc-500">
                                {debouncedSearch
                                    ? 'Nenhum creator encontrado.'
                                    : 'Nenhum creator disponível.'}
                            </p>
                        </div>
                    )}

                    {!isLoading && creators.length > 0 && (
                        <div className="space-y-2">
                            {creators.map((creator: CreatorOption) => {
                                const isSelected = selectedIds.has(creator.id)
                                return (
                                    <div
                                        key={creator.id}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer',
                                            'hover:bg-zinc-50 dark:hover:bg-zinc-900',
                                            isSelected &&
                                            'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
                                        )}
                                        onClick={() => handleToggle(creator.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleToggle(creator.id)
                                            }
                                        }}
                                        aria-pressed={isSelected}
                                        aria-label={`${isSelected ? 'Desselecionar' : 'Selecionar'} ${creator.name}`}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggle(creator.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-hidden="true"
                                        />

                                        {creator.avatar ? (
                                            <img
                                                src={creator.avatar}
                                                alt={creator.name}
                                                className="size-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm dark:bg-blue-900 dark:text-blue-300">
                                                {getInitials(creator.name)}
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {creator.name}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                {creator.email}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Infinite scroll sentinel */}
                            <InfiniteScrollSentinel
                                hasNextPage={query.hasNextPage}
                                isFetchingNextPage={query.isFetchingNextPage}
                                onIntersect={handleFetchNextPage}
                            />
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button size="sm" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirm}
                        disabled={selectedCount === 0}
                    >
                        Confirmar ({selectedCount})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
