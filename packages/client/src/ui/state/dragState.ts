import { writable } from 'svelte/store'

import type { PlantPlacement } from '../../lib/plant-placement'
import type { NullableObject } from '../../lib/type-utils'

export interface IDragState {
	draggedPlant: PlantPlacement
	draggedTileSize: number
	dragOffset: { x: number; y: number }
	dragPosition: { x: number; y: number }
	highlightedCell: { x: number; y: number }
	sourceBedId: string
	targetBedId: string
}

export const dragState = writable<NullableObject<IDragState>>({
	draggedPlant: null,
	draggedTileSize: null,
	dragOffset: null,
	dragPosition: null,
	highlightedCell: null,
	sourceBedId: null,
	targetBedId: null,
})

export function isDragStatePopulated(
	state: NullableObject<IDragState>,
): state is IDragState {
	return (
		state.draggedPlant !== null &&
		state.draggedTileSize !== null &&
		state.dragOffset !== null &&
		state.dragPosition !== null &&
		state.highlightedCell !== null &&
		state.sourceBedId !== null &&
		state.targetBedId !== null
	)
}
