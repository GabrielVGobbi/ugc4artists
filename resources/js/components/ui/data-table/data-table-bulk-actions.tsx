import { X } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * Configuration for a bulk action button.
 */
export interface BulkAction {
	/** Display label for the action button */
	label: string
	/** Optional icon to display before the label */
	icon?: ReactNode
	/** Handler called when the action is executed */
	onClick: () => void
	/** Button variant - 'default' or 'destructive' */
	variant?: 'default' | 'destructive'
	/** Whether to show a confirmation dialog before executing */
	requireConfirmation?: boolean
	/** Title for the confirmation dialog */
	confirmationTitle?: string
	/** Message for the confirmation dialog */
	confirmationMessage?: string
}

/**
 * Props for the DataTableBulkActions component.
 */
export interface DataTableBulkActionsProps {
	/** Number of currently selected rows */
	selectedCount: number
	/** Handler called when the user clicks "Clear selection" */
	onClearSelection: () => void
	/** Array of bulk action configurations */
	actions: BulkAction[]
	/** Additional CSS classes for the toolbar container */
	className?: string
}

/**
 * State for the confirmation dialog.
 */
interface ConfirmationState {
	isOpen: boolean
	action: BulkAction | null
}

/**
 * DataTableBulkActions component displays a toolbar when rows are selected,
 * showing the selected count and configurable action buttons.
 *
 * Features:
 * - Toolbar that appears when rows are selected (selectedCount > 0)
 * - Displays the count of selected items
 * - Configurable action buttons with optional icons
 * - Support for destructive actions with visual distinction
 * - Confirmation dialog support for actions that require user confirmation
 * - "Clear selection" button to deselect all rows
 *
 * @example
 * ```tsx
 * <DataTableBulkActions
 *   selectedCount={selectedIds.size}
 *   onClearSelection={() => clearSelection()}
 *   actions={[
 *     {
 *       label: 'Delete',
 *       icon: <Trash2 className="size-4" />,
 *       onClick: () => handleBulkDelete(),
 *       variant: 'destructive',
 *       requireConfirmation: true,
 *       confirmationTitle: 'Delete selected items?',
 *       confirmationMessage: 'This action cannot be undone.',
 *     },
 *     {
 *       label: 'Export',
 *       icon: <Download className="size-4" />,
 *       onClick: () => handleExport(),
 *     },
 *   ]}
 * />
 * ```
 *
 * @requirement 6.4 - WHEN rows are selected, THE DataTable_Component SHALL display a bulk actions toolbar
 * @requirement 6.5 - THE Bulk_Actions_Toolbar SHALL support configurable action buttons with confirmation dialogs
 */
export function DataTableBulkActions({
	selectedCount,
	onClearSelection,
	actions,
	className,
}: DataTableBulkActionsProps) {
	const [confirmation, setConfirmation] = useState<ConfirmationState>({
		isOpen: false,
		action: null,
	})

	// Don't render if no rows are selected
	if (selectedCount === 0) {
		return null
	}

	/**
	 * Handles clicking an action button.
	 * If the action requires confirmation, opens the confirmation dialog.
	 * Otherwise, executes the action immediately.
	 */
	const handleActionClick = (action: BulkAction) => {
		if (action.requireConfirmation) {
			setConfirmation({
				isOpen: true,
				action,
			})
		} else {
			action.onClick()
		}
	}

	/**
	 * Handles confirming the action in the confirmation dialog.
	 * Executes the action and closes the dialog.
	 */
	const handleConfirm = () => {
		if (confirmation.action) {
			confirmation.action.onClick()
		}
		setConfirmation({ isOpen: false, action: null })
	}

	/**
	 * Handles canceling the confirmation dialog.
	 * Closes the dialog without executing the action.
	 */
	const handleCancel = () => {
		setConfirmation({ isOpen: false, action: null })
	}

	/**
	 * Handles the dialog open state change.
	 * Used to close the dialog when clicking outside or pressing Escape.
	 */
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setConfirmation({ isOpen: false, action: null })
		}
	}

	// Format the selected count message
	const selectedMessage =
		selectedCount === 1
			? '1 item selecionado'
			: `${selectedCount} itens selecionados`

	return (
		<>
			<div
				className={cn(
					'flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm mb-4',
					'animate-in fade-in-0 slide-in-from-top-2 duration-200',
					className
				)}
				role="toolbar"
				aria-label="Ações em lote"
			>
				{/* Selected count */}
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-foreground">
						{selectedMessage}
					</span>
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-2">
					{actions.map((action, index) => (
						<Button
							key={`${action.label}-${index}`}
							variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
							size="sm"
							onClick={() => handleActionClick(action)}
							className="gap-1.5"
						>
							{action.icon}
							<span>{action.label}</span>
						</Button>
					))}

					{/* Clear selection button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearSelection}
						className="gap-1.5 text-muted-foreground hover:text-foreground"
						aria-label="Limpar seleção"
					>
						<X className="size-4" />
						<span className="hidden sm:inline">Limpar</span>
					</Button>
				</div>
			</div>

			{/* Confirmation Dialog */}
			<Dialog open={confirmation.isOpen} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{confirmation.action?.confirmationTitle || 'Confirmar ação'}
						</DialogTitle>
						<DialogDescription>
							{confirmation.action?.confirmationMessage ||
								`Você está prestes a executar esta ação em ${selectedCount} ${selectedCount === 1 ? 'item' : 'itens'}. Deseja continuar?`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={handleCancel}>
							Cancelar
						</Button>
						<Button
							variant={
								confirmation.action?.variant === 'destructive'
									? 'destructive'
									: 'default'
							}
							onClick={handleConfirm}
						>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
