import { writable, type Writable } from 'svelte/store'
import type { GridPlaceable } from '../../grid/grid-placement'
import type { IndicatorForTooltip } from '../types'
import IndicatorTooltipContent from '../../../lib/IndicatorTooltipContent.svelte'

export interface Tooltip {
	id: string
	position: { x: number; y: number; orientation: string }
	item?: GridPlaceable
	indicator?: IndicatorForTooltip
	tileCenterX: number
	tileCenterY: number
}

export interface TooltipStore extends Writable<Tooltip | null> {
	show: (tooltip: Tooltip) => void
	hide: (id: string) => void
	IndicatorTooltipContent: typeof IndicatorTooltipContent
}

function createTooltipStore(): TooltipStore {
	const { subscribe, set, update } = writable<Tooltip | null>(null)

	return {
		subscribe,
		set,
		update,
		show: (tooltip: Tooltip) => {
			set(tooltip)
		},
		hide: (id: string) => {
			update((current) => (current?.id === id ? null : current))
		},
		IndicatorTooltipContent,
	}
}

export const tooltipStore = createTooltipStore()

export const showTooltip = (tooltip: Omit<Tooltip, 'item'> & { item: GridPlaceable }) => {
	tooltipStore.show(tooltip as Tooltip)
}

export const showIndicatorTooltip = (
	tooltip: Omit<Tooltip, 'indicator'> & { indicator: IndicatorForTooltip },
) => {
	tooltipStore.show(tooltip as Tooltip)
}

export const hideTooltip = (id: string) => {
	tooltipStore.hide(id)
}