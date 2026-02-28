import { useCallback, useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Loader2, XCircle } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { http, toApiError } from '@/lib/http'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RejectDialogProps {
	campaignId: number
	isOpen: boolean
	onClose: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 2000

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const buildRefuseUrl = (campaignId: number): string =>
	`/api/v1/admin/campaigns/${campaignId}/refuse`

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dialog for refusing a campaign with a required justification.
 * Features inline validation (min 5 characters), character count,
 * and loading state during submission.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */
function RejectDialog({ campaignId, isOpen, onClose }: RejectDialogProps) {
	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [hasInteracted, setHasInteracted] = useState(false)

	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const trimmedReason = reason.trim()
	const characterCount = trimmedReason.length
	const isValid = characterCount >= MIN_REASON_LENGTH
	const shouldShowError = hasInteracted && !isValid

	// ── Reset state when dialog opens/closes ─────────────────────
	useEffect(() => {
		if (isOpen) {
			setReason('')
			setHasInteracted(false)
			setIsSubmitting(false)

			setTimeout(() => {
				textareaRef.current?.focus()
			}, 100)
		}
	}, [isOpen])

	// ── Handle textarea change ───────────────────────────────────
	const handleReasonChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setReason(e.target.value)
			if (!hasInteracted) {
				setHasInteracted(true)
			}
		},
		[hasInteracted],
	)

	// ── Submit refusal ───────────────────────────────────────────
	const handleSubmit = useCallback(async () => {
		setHasInteracted(true)

		if (!isValid) return

		setIsSubmitting(true)

		try {
			await http.post(buildRefuseUrl(campaignId), {
				reason_for_refusal: trimmedReason,
			})

			toast.success('Campanha recusada com sucesso.')
			onClose()
			router.visit(window.location.href, {
				preserveScroll: true,
			})
		} catch (err: unknown) {
			const apiError = toApiError(err)
			const errorMessage =
				apiError.type === 'validation'
					? 'Dados inválidos. Verifique a justificativa informada.'
					: apiError.message
			toast.error(errorMessage ?? 'Erro ao recusar campanha.')
		} finally {
			setIsSubmitting(false)
		}
	}, [campaignId, trimmedReason, isValid, onClose])

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
				className="sm:max-w-lg"
				aria-describedby="reject-dialog-description"
			>
				{/* ── Header ──────────────────────────────── */}
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
							<XCircle className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-base">
								Recusar Campanha
							</DialogTitle>
							<DialogDescription id="reject-dialog-description">
								Informe o motivo da recusa para o anunciante
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* ── Justification Field ─────────────────── */}
				<div className="space-y-2">
					<Label htmlFor="reject-reason">Justificativa</Label>
					<Textarea
						ref={textareaRef}
						id="reject-reason"
						value={reason}
						onChange={handleReasonChange}
						placeholder="Descreva o motivo da recusa..."
						disabled={isSubmitting}
						maxLength={MAX_REASON_LENGTH}
						rows={4}
						className={
							shouldShowError
								? 'border-rose-300 focus-visible:ring-rose-200'
								: ''
						}
						aria-invalid={shouldShowError}
						aria-describedby={
							shouldShowError
								? 'reject-reason-error'
								: 'reject-reason-count'
						}
					/>

					<div className="flex items-center justify-between gap-2">
						{shouldShowError ? (
							<p
								id="reject-reason-error"
								className="text-sm text-rose-500 font-medium"
								role="alert"
							>
								A justificativa deve ter no mínimo 5 caracteres
							</p>
						) : (
							<span />
						)}
						<span
							id="reject-reason-count"
							className={`text-xs tabular-nums ${
								characterCount >= MIN_REASON_LENGTH
									? 'text-zinc-400'
									: 'text-zinc-300'
							}`}
						>
							{characterCount}/{MAX_REASON_LENGTH}
						</span>
					</div>
				</div>

				{/* ── Footer ─────────────────────────────── */}
				<DialogFooter className="gap-2 sm:gap-0">
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
						disabled={isSubmitting || !isValid}
						className="bg-rose-600 hover:bg-rose-700"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Recusando...
							</>
						) : (
							<>
								<XCircle className="size-4" />
								Recusar Campanha
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export { RejectDialog }
export type { RejectDialogProps }
