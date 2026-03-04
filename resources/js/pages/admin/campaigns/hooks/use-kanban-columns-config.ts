import { useCallback, useState } from 'react'

import type { CampaignStatusValue } from '@/types/campaign'
import {
	ALL_KANBAN_STATUSES,
	CAMPAIGN_STATUS_LABELS,
	KANBAN_COLUMN_STATUSES,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ugc_kanban_columns_v1'
const COLLAPSED_KEY = 'ugc_kanban_collapsed_v1'

const DEFAULT_VISIBLE = [...KANBAN_COLUMN_STATUSES] as CampaignStatusValue[]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readVisibleFromStorage(): CampaignStatusValue[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return DEFAULT_VISIBLE
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return DEFAULT_VISIBLE
		const valid = (parsed as string[]).filter((v): v is CampaignStatusValue =>
			(ALL_KANBAN_STATUSES as readonly string[]).includes(v),
		)
		return valid.length > 0 ? valid : DEFAULT_VISIBLE
	} catch {
		return DEFAULT_VISIBLE
	}
}

function writeVisibleToStorage(statuses: CampaignStatusValue[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
	} catch {
		// Ignore storage errors
	}
}

function readCollapsedFromStorage(): Set<CampaignStatusValue> {
	try {
		const raw = localStorage.getItem(COLLAPSED_KEY)
		if (!raw) return new Set()
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return new Set()
		return new Set(
			(parsed as string[]).filter((v): v is CampaignStatusValue =>
				(ALL_KANBAN_STATUSES as readonly string[]).includes(v),
			),
		)
	} catch {
		return new Set()
	}
}

function writeCollapsedToStorage(collapsed: Set<CampaignStatusValue>): void {
	try {
		localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsed]))
	} catch {
		// Ignore storage errors
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface KanbanColumnOption {
	status: CampaignStatusValue
	label: string
	isVisible: boolean
	isCollapsed: boolean
}

export interface UseKanbanColumnsConfigReturn {
	/** Ordered list of visible status columns */
	visibleStatuses: CampaignStatusValue[]
	/** Set of collapsed column statuses */
	collapsedStatuses: Set<CampaignStatusValue>
	/** All available column options with visibility/collapse state */
	allColumnOptions: KanbanColumnOption[]
	/** Add a status column to the visible list */
	addColumn: (status: CampaignStatusValue) => void
	/** Remove a status column from the visible list */
	removeColumn: (status: CampaignStatusValue) => void
	/** Toggle visibility of a status column */
	toggleColumn: (status: CampaignStatusValue) => void
	/** Toggle collapse state of a column */
	toggleCollapse: (status: CampaignStatusValue) => void
	/** Reset to default column configuration */
	resetToDefault: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manages kanban column visibility and collapse state, persisted to localStorage.
 *
 * Visible columns are stored as an ordered array — their order in the array
 * determines their order in the kanban board. Collapsed columns keep their
 * query alive (cache preserved) but only show the header.
 *
 * @example
 * const { visibleStatuses, toggleCollapse, toggleColumn } = useKanbanColumnsConfig()
 */
export function useKanbanColumnsConfig(): UseKanbanColumnsConfigReturn {
	const [visibleStatuses, setVisibleStatuses] = useState<CampaignStatusValue[]>(
		() => readVisibleFromStorage(),
	)

	const [collapsedStatuses, setCollapsedStatuses] = useState<
		Set<CampaignStatusValue>
	>(() => readCollapsedFromStorage())

	const addColumn = useCallback((status: CampaignStatusValue) => {
		setVisibleStatuses((prev) => {
			if (prev.includes(status)) return prev
			const next = [...prev, status]
			writeVisibleToStorage(next)
			return next
		})
	}, [])

	const removeColumn = useCallback((status: CampaignStatusValue) => {
		setVisibleStatuses((prev) => {
			const next = prev.filter((s) => s !== status)
			writeVisibleToStorage(next)
			return next
		})
	}, [])

	const toggleColumn = useCallback((status: CampaignStatusValue) => {
		setVisibleStatuses((prev) => {
			const isVisible = prev.includes(status)
			const next = isVisible
				? prev.filter((s) => s !== status)
				: [...prev, status]
			writeVisibleToStorage(next)
			return next
		})
	}, [])

	const toggleCollapse = useCallback((status: CampaignStatusValue) => {
		setCollapsedStatuses((prev) => {
			const next = new Set(prev)
			if (next.has(status)) {
				next.delete(status)
			} else {
				next.add(status)
			}
			writeCollapsedToStorage(next)
			return next
		})
	}, [])

	const resetToDefault = useCallback(() => {
		const defaultVisible = [...KANBAN_COLUMN_STATUSES] as CampaignStatusValue[]
		writeVisibleToStorage(defaultVisible)
		setVisibleStatuses(defaultVisible)
		writeCollapsedToStorage(new Set())
		setCollapsedStatuses(new Set())
	}, [])

	const allColumnOptions: KanbanColumnOption[] = ALL_KANBAN_STATUSES.map(
		(status) => ({
			status,
			label: CAMPAIGN_STATUS_LABELS[status],
			isVisible: visibleStatuses.includes(status),
			isCollapsed: collapsedStatuses.has(status),
		}),
	)

	return {
		visibleStatuses,
		collapsedStatuses,
		allColumnOptions,
		addColumn,
		removeColumn,
		toggleColumn,
		toggleCollapse,
		resetToDefault,
	}
}
