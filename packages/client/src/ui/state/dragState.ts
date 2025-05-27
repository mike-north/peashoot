import { writable } from 'svelte/store'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'

// Types of drag sources
export type DragSourceType = 'existing-plant' | 'new-plant'

// Types of drop targets
export type DropTargetType = 'garden-bed' | 'delete-zone'

// Enhanced drag state that can handle both existing plants and new plants from toolbar
export interface IDragState {
	// What's being dragged
	draggedPlant: PlantPlacement | null // For existing plants
	draggedNewPlant: Plant | null // For new plants from toolbar
	draggedTileSize: number
	dragSourceType: DragSourceType

	// Mouse tracking
	dragOffset: { x: number; y: number }
	dragPosition: { x: number; y: number }

	// Target information
	highlightedCell: { x: number; y: number } | null
	sourceBedId: string | null // Only for existing plants
	targetBedId: string | null // For garden bed drops
	targetType: DropTargetType | null
}

export const dragState = writable<IDragState>({
	draggedPlant: null,
	draggedNewPlant: null,
	draggedTileSize: 1,
	dragSourceType: 'existing-plant',
	dragOffset: { x: 0, y: 0 },
	dragPosition: { x: 0, y: 0 },
	highlightedCell: null,
	sourceBedId: null,
	targetBedId: null,
	targetType: null,
})

export function isDragStatePopulated(state: IDragState): boolean {
	const hasValidDraggedItem =
		state.draggedPlant !== null || state.draggedNewPlant !== null
	const hasValidPosition = state.dragPosition.x !== 0 || state.dragPosition.y !== 0
	return hasValidDraggedItem && hasValidPosition
}

export function isDraggingExistingPlant(state: IDragState): state is IDragState & {
	draggedPlant: PlantPlacement
	sourceBedId: string
} {
	return (
		state.dragSourceType === 'existing-plant' &&
		state.draggedPlant !== null &&
		state.sourceBedId !== null
	)
}

export function isDraggingNewPlant(state: IDragState): state is IDragState & {
	draggedNewPlant: Plant
} {
	return state.dragSourceType === 'new-plant' && state.draggedNewPlant !== null
}

// Helper to get the plant being dragged regardless of source type
export function getDraggedPlantInfo(
	state: IDragState,
): { plant: Plant; size: number } | null {
	if (isDraggingExistingPlant(state)) {
		return {
			plant: state.draggedPlant.plantTile,
			size: state.draggedPlant.plantTile.size || 1,
		}
	} else if (isDraggingNewPlant(state)) {
		return {
			plant: state.draggedNewPlant,
			size: state.draggedNewPlant.size || 1,
		}
	}
	return null
}
