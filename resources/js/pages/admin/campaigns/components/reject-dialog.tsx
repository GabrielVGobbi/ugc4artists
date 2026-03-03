import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, XCircle } from 'lucide-react'

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
import type {
	Campaign,
	RefuseCampaignInput,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RejectDialogProps {
	campaign: Campaign | null
	isOpen: boolean
	onClose: () => void
	onRefuse: (input: RefuseCampaignInput) => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 2000

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dialog for refusing a campaign with a required justification.
 * Features inline validation (min 5 characters), character count,
 * and loading state during submission.
 *
 * Mutations are passed as props from the parent — no direct
 * API calls for refuse. On success the dialog closes; on
 * error the error message is shown and the dialog stays open.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2
 */
function RejectDialog ({
	campaign,
	isOpen,
	onClose,
	onRefuse,
}: RejectDialogProps) {
	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [hasInteracted, setHasInteracted] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(
		null,
	)

	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const trimmedReason = reason.trim()
	const characterCount = trimmedReason.length
	const isValid = characterCount >= MIN_REASON_LENGTH
	const shouldShowValidationError = hasInteracted && !isValid

	// ── Reset state when dialog opens/closes ─────────────────────
	useEffect(() => {
		if (isOpen) {
			setReason('')
			setHasInteracted(false)
			setIsSubmitting(false)
			setErrorMessage(null)

			setTimeout(() => {
				textareaRef.current?.focus()
			}, 100)
		}
	}, [isOpen])

	// ── Handle textarea change ───────────────────────────────────
	const handleReasonChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setReason(e.target.value)
			setErrorMessage(null)
			if (!hasInteracted) {
				setHasInteracted(true)
			}
		},
		[hasInteracted],
	)

	// ── Submit refusal via mutation prop ──────────────────────────
	const handleSubmit = useCallback(async () => {
		setHasInteracted(true)
		setErrorMessage(null)

		if (!isValid || !campaign) return

		setIsSubmitting(true)

		try {
			await onRefuse({
				campaignUuid: campaign.uuid,
				reason: trimmedReason,
			})

			// Success — close dialog (cache update handled by mutation)
			onClose()
		} catch (err: unknown) {
			// Error — keep dialog open and show error message
			const message =
				err instanceof Error
					? err.message
					: 'Erro ao recusar campanha.'
			setErrorMessage(message)
		} finally {
			setIsSubmitting(false)
		}
	}, [campaign, trimmedReason, isValid, onRefuse, onClose])

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
				aria-modal="true"
				aria-labelledby="reject-dialog-title"
				aria-describedby="reject-dialog-description"
			>
				{/* ── Header ──────────────────────────────── */}
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
							<XCircle className="size-5" />
						</div>
						<div>
							<DialogTitle
								id="reject-dialog-title"
								className="text-base"
							>
								Recusar Campanha
							</DialogTitle>
							<DialogDescription
								id="reject-dialog-description"
							>
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
							shouldShowValidationError
								? 'border-rose-300 focus-visible:ring-rose-200'
								: ''
						}
						aria-invalid={shouldShowValidationError}
						aria-describedby={
							shouldShowValidationError
								? 'reject-reason-error'
								: 'reject-reason-count'
						}
					/>

					<div className="flex items-center justify-between gap-2">
						{shouldShowValidationError ? (
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

				{/* ── API Error ───────────────────────────── */}
				{errorMessage && (
					<p
						className="text-sm text-rose-500 font-medium"
						role="alert"
						aria-live="assertive"
					>
						{errorMessage}
					</p>
				)}

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
