import { useCallback, useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import {
	CheckCircle2,
	Loader2,
	Search,
	Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { http, toApiError } from '@/lib/http'

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

interface CreatorsResponse {
	data: Creator[]
}

interface ApproveDialogProps {
	campaignId: number
	isOpen: boolean
	onClose: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300
const CREATORS_API_URL = '/api/v1/admin/campaigns/creators'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name: string): string =>
	name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase()

const buildApproveUrl = (campaignId: number): string =>
	`/api/v1/admin/campaigns/${campaignId}/approve`

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dialog for approving a campaign by selecting one or more
 * creators. Features debounced search, multi-select with
 * checkboxes, and inline validation requiring at least one
 * creator selected.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */
function ApproveDialog ({
	campaignId,
	isOpen,
	onClose,
}: ApproveDialogProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [creators, setCreators] = useState<Creator[]>([])
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		new Set(),
	)
	const [isSearching, setIsSearching] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	)
	const abortRef = useRef<AbortController | null>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const hasSelection = selectedIds.size > 0
	const shouldShowError = hasAttemptedSubmit && !hasSelection

	// ── Fetch creators with debounce ─────────────────────────────
	const fetchCreators = useCallback(
		async (search: string) => {
			abortRef.current?.abort()
			const controller = new AbortController()
			abortRef.current = controller

			setIsSearching(true)

			try {
				const params = new URLSearchParams()
				if (search.trim()) {
					params.set('search', search.trim())
				}

				const url = params.toString()
					? `${CREATORS_API_URL}?${params.toString()}`
					: CREATORS_API_URL

				const response = await http.get<CreatorsResponse>(
					url,
					{ signal: controller.signal },
				)

				if (!controller.signal.aborted) {
					setCreators(response.data.data)
				}
			} catch (err: unknown) {
				if (
					err instanceof DOMException &&
					err.name === 'AbortError'
				) {
					return
				}
				if (!controller.signal.aborted) {
					setCreators([])
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsSearching(false)
				}
			}
		},
		[],
	)

	// ── Debounced search effect ──────────────────────────────────
	useEffect(() => {
		if (!isOpen) return

		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
		}

		debounceRef.current = setTimeout(() => {
			fetchCreators(searchTerm)
		}, DEBOUNCE_MS)

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
		}
	}, [searchTerm, isOpen, fetchCreators])

	// ── Reset state when dialog opens/closes ─────────────────────
	useEffect(() => {
		if (isOpen) {
			setSearchTerm('')
			setSelectedIds(new Set())
			setHasAttemptedSubmit(false)
			setIsSubmitting(false)
			setCreators([])

			// Focus search input after dialog animation
			setTimeout(() => {
				searchInputRef.current?.focus()
			}, 100)
		} else {
			abortRef.current?.abort()
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
		}
	}, [isOpen])

	// ── Cleanup on unmount ───────────────────────────────────────
	useEffect(() => {
		return () => {
			abortRef.current?.abort()
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
		}
	}, [])

	// ── Toggle creator selection ─────────────────────────────────
	const handleToggleCreator = useCallback((creatorId: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(creatorId)) {
				next.delete(creatorId)
			} else {
				next.add(creatorId)
			}
			return next
		})
	}, [])

	// ── Handle search input change ───────────────────────────────
	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value)
		},
		[],
	)

	// ── Submit approval ──────────────────────────────────────────
	const handleSubmit = useCallback(async () => {
		setHasAttemptedSubmit(true)

		if (selectedIds.size === 0) return

		setIsSubmitting(true)

		try {
			await http.post(buildApproveUrl(campaignId), {
				creator_ids: Array.from(selectedIds),
			})

			toast.success('Campanha aprovada com sucesso.')
			onClose()
			router.visit(window.location.href, {
				preserveScroll: true,
			})
		} catch (err: unknown) {
			const apiError = toApiError(err)
			const errorMessage =
				apiError.type === 'validation'
					? 'Dados inválidos. Verifique os creators selecionados.'
					: apiError.message
			toast.error(errorMessage ?? 'Erro ao aprovar campanha.')
		} finally {
			setIsSubmitting(false)
		}
	}, [campaignId, selectedIds, onClose])

	// ── Handle dialog open change ────────────────────────────────
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !isSubmitting) {
				onClose()
			}
		},
		[onClose, isSubmitting],
	)

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className="sm:max-w-lg max-h-[85vh] flex flex-col"
				aria-describedby="approve-dialog-description"
			>
				{/* ── Header ──────────────────────────────── */}
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
							<CheckCircle2 className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-base">
								Aprovar Campanha
							</DialogTitle>
							<DialogDescription
								id="approve-dialog-description"
							>
								Selecione os creators para esta campanha
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* ── Search ──────────────────────────────── */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<input
						ref={searchInputRef}
						type="text"
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder="Buscar creators por nome ou email..."
						className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-200"
						aria-label="Buscar creators"
						disabled={isSubmitting}
					/>
					{isSearching && (
						<Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-zinc-400" />
					)}
				</div>

				{/* ── Creator List ────────────────────────── */}
				<div className="min-h-0 flex-1 overflow-y-auto -mx-6 px-6">
					{isSearching && creators.length === 0 ? (
						<div
							className="flex flex-col items-center justify-center gap-2 py-10"
							role="status"
							aria-label="Buscando creators"
						>
							<Loader2 className="size-6 animate-spin text-zinc-300" />
							<p className="text-sm text-zinc-400">
								Buscando creators...
							</p>
						</div>
					) : creators.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-10">
							<Users className="size-8 text-zinc-200" />
							<p className="text-sm text-zinc-400">
								{searchTerm.trim()
									? 'Nenhum creator encontrado'
									: 'Digite para buscar creators'}
							</p>
						</div>
					) : (
						<div
							className="space-y-1"
							role="listbox"
							aria-label="Lista de creators"
							aria-multiselectable="true"
						>
							{creators.map((creator) => {
								const isSelected = selectedIds.has(
									creator.id,
								)

								return (
									<button
										key={creator.id}
										type="button"
										role="option"
										aria-selected={isSelected}
										onClick={() =>
											handleToggleCreator(creator.id)
										}
										disabled={isSubmitting}
										className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all ${
											isSelected
												? 'border-emerald-200 bg-emerald-50/50'
												: 'border-transparent bg-zinc-50/30 hover:bg-zinc-50'
										} disabled:cursor-not-allowed disabled:opacity-50`}
									>
										<Checkbox
											checked={isSelected}
											tabIndex={-1}
											aria-hidden="true"
											className="pointer-events-none"
										/>
										<Avatar className="size-9">
											{creator.avatar ? (
												<AvatarImage
													src={creator.avatar}
													alt={creator.name}
												/>
											) : null}
											<AvatarFallback className="bg-zinc-200 text-xs text-zinc-600">
												{getInitials(creator.name)}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-800">
												{creator.name}
											</p>
											<p className="truncate text-xs text-zinc-500">
												{creator.email}
											</p>
										</div>
										{isSelected && (
											<CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
										)}
									</button>
								)
							})}
						</div>
					)}
				</div>

				{/* ── Validation Error ────────────────────── */}
				{shouldShowError && (
					<p
						className="text-sm text-rose-500 font-medium"
						role="alert"
					>
						Selecione ao menos um creator
					</p>
				)}

				{/* ── Footer ─────────────────────────────── */}
				<DialogFooter className="gap-2 sm:gap-0">
					{selectedIds.size > 0 && (
						<span className="mr-auto text-xs text-zinc-500 self-center">
							{selectedIds.size}{' '}
							{selectedIds.size === 1
								? 'creator selecionado'
								: 'creators selecionados'}
						</span>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
					<Button
						variant="default"
						size="sm"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="bg-emerald-600 hover:bg-emerald-700"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Aprovando...
							</>
						) : (
							<>
								<CheckCircle2 className="size-4" />
								Aprovar Campanha
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export { ApproveDialog }
export type { ApproveDialogProps, Creator }
