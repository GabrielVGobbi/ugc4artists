import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, User as UserIcon, X } from 'lucide-react'
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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Creator {
    id: number
    uuid: string
    name: string
    email: string
    avatar: string | null
}

interface SelectCreatorsModalProps {
    /** Whether the modal is open */
    open: boolean
    /** Callback when the modal is closed */
    onClose: () => void
    /** Callback when creators are selected */
    onConfirm: (creatorIds: number[]) => void
    /** IDs of already selected creators (pre-selected) */
    initialSelectedIds?: number[]
    /** Maximum number of creators that can be selected (from campaign.slots_to_approve) */
    maxSelections?: number
}

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
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal for selecting creators to send campaign to.
 *
 * Features:
 * - Fetches creators from API
 * - Search by name/email
 * - Multiple selection with checkboxes
 * - Shows selected count
 * - Validates at least one creator is selected
 *
 * @example
 * <SelectCreatorsModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={(ids) => handleSendToCreators(ids)}
 *   initialSelectedIds={[1, 2, 3]}
 * />
 */
export function SelectCreatorsModal({
    open,
    onClose,
    onConfirm,
    initialSelectedIds = [],
    maxSelections,
}: SelectCreatorsModalProps) {
    const [creators, setCreators] = useState<Creator[]>([])
    const [filteredCreators, setFilteredCreators] = useState<Creator[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<number>>(
        new Set(initialSelectedIds),
    )
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // ── Fetch creators ────────────────────────────────────────────────

    useEffect(() => {
        if (!open) return

        const fetchCreators = async () => {
            setIsLoading(true)
            try {
                const response = await httpGet<{ data: Creator[] }>(
                    '/api/v1/admin/campaigns/creators',
                    {
                        params: { limit: 100 },
                    },
                )
                setCreators(response.data)
                setFilteredCreators(response.data)
            } catch (error) {
                toast.error('Erro ao carregar creators.')
                console.error('Failed to fetch creators:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCreators()
        setSelectedIds(new Set(initialSelectedIds))
        setSearch('')
    }, [open]) // Removido fetchCreators e initialSelectedIds das dependências

    // ── Search filter ─────────────────────────────────────────────────

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredCreators(creators)
        } else {
            const searchLower = search.toLowerCase()
            setFilteredCreators(
                creators.filter(
                    (c) =>
                        c.name.toLowerCase().includes(searchLower) ||
                        c.email.toLowerCase().includes(searchLower),
                ),
            )
        }
    }, [search, creators])

    // ── Handlers ──────────────────────────────────────────────────────

    const handleToggle = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                // Check max selections limit
                if (maxSelections && next.size >= maxSelections) {
                    toast.error(
                        `Você pode selecionar no máximo ${maxSelections} creator${maxSelections > 1 ? 's' : ''} para esta campanha.`,
                    )
                    return prev
                }
                next.add(id)
            }
            return next
        })
    }, [maxSelections])

    const handleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            if (prev.size === filteredCreators.length) {
                return new Set()
            }

            // If max selections is set, limit to that number
            if (maxSelections) {
                const limitedCreators = filteredCreators.slice(0, maxSelections)
                if (filteredCreators.length > maxSelections) {
                    toast.info(
                        `Selecionados apenas ${maxSelections} creators (limite da campanha).`,
                    )
                }
                return new Set(limitedCreators.map((c) => c.id))
            }

            return new Set(filteredCreators.map((c) => c.id))
        })
    }, [filteredCreators, maxSelections])

    const handleConfirm = useCallback(() => {
        if (selectedIds.size === 0) {
            toast.error('Selecione pelo menos um creator.')
            return
        }

        if (maxSelections && selectedIds.size > maxSelections) {
            toast.error(
                `Você selecionou ${selectedIds.size} creators, mas o limite é ${maxSelections}.`,
            )
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

    // ── Render ────────────────────────────────────────────────────────

    const selectedCount = useMemo(() => selectedIds.size, [selectedIds])
    const allSelected = useMemo(
        () =>
            filteredCreators.length > 0 &&
            selectedIds.size === filteredCreators.length,
        [filteredCreators.length, selectedIds],
    )

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecionar Creators</DialogTitle>
                    <DialogDescription>
                        Selecione os creators que receberão esta campanha. Eles
                        poderão aceitar ou recusar a participação.
                        {maxSelections && (
                            <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
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
                    />
                </div>

                {/* Select all + counter */}
                <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            disabled={isLoading || filteredCreators.length === 0}
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Selecionar todos
                        </label>
                    </div>
                    <Badge
                        variant={
                            maxSelections && selectedCount >= maxSelections
                                ? 'default'
                                : 'primary'
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

                    {!isLoading && filteredCreators.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                <UserIcon className="size-5 text-zinc-400" />
                            </div>
                            <p className="text-sm text-zinc-500">
                                {search
                                    ? 'Nenhum creator encontrado.'
                                    : 'Nenhum creator disponível.'}
                            </p>
                        </div>
                    )}

                    {!isLoading && filteredCreators.length > 0 && (
                        <div className="space-y-2">
                            {filteredCreators.map((creator) => {
                                const isSelected = selectedIds.has(creator.id)
                                return (
                                    <div
                                        key={creator.id}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
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
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggle(creator.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {/* Avatar */}
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

                                        {/* Info */}
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
