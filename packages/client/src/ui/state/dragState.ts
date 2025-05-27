import { writable } from 'svelte/store'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import type { Garden } from '../../lib/garden'

// Types of drag sources
export type DragSourceType = 'existing-plant' | 'new-plant'

// Types of drop targets
export type DropTargetType = 'garden-bed' | 'delete-zone'

// Async validation states
export type ValidationState = 'pending' | 'success' | 'error'

// Operation types for validation
export type OperationType = 'within-bed-move' | 'across-beds-move' | 'addition' | 'removal'

// Validation context for async operations
export interface ValidationContext {
	operationType: OperationType
	garden: Garden
	plant: Plant
	sourceBedId?: string
	targetBedId?: string
	sourceX?: number | undefined
	sourceY?: number | undefined
	targetX?: number | undefined
	targetY?: number | undefined
	plantId?: string // For existing plants
}

// Validation function type
export type AsyncValidationFunction = (context: ValidationContext) => Promise<void>

// Pending operation for async validation
export interface PendingOperation {
	id: string
	type: 'placement' | 'removal'
	bedId?: string // For placements
	x?: number // For placements
	y?: number // For placements
	size: number
	plant: Plant
	state: ValidationState
	timestamp: number
}

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

// Separate store for pending operations
export const pendingOperations = writable<PendingOperation[]>([])

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

// Helper functions for managing pending operations
export function addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>): string {
	const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
	const pendingOp: PendingOperation = {
		...operation,
		id,
		timestamp: Date.now(),
	}
	
	pendingOperations.update(ops => [...ops, pendingOp])
	return id
}

export function updatePendingOperation(id: string, state: ValidationState) {
	pendingOperations.update(ops => 
		ops.map(op => op.id === id ? { ...op, state } : op)
	)
}

export function removePendingOperation(id: string) {
	pendingOperations.update(ops => ops.filter(op => op.id !== id))
}

// Default async validation function (can be overridden)
export const defaultAsyncValidation: AsyncValidationFunction = async (context: ValidationContext) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('[Validation]', context.operationType, context)
			
			// Example validation logic based on operation type
			switch (context.operationType) {
				case 'within-bed-move':
					// 95% success rate for moves within same bed
					if (Math.random() > 0.05) resolve()
					else reject(new Error('Within-bed move validation failed'))
					break
					
				case 'across-beds-move':
					// 85% success rate for moves across beds
					if (Math.random() > 0.15) resolve()
					else reject(new Error('Cross-bed move validation failed'))
					break
					
				case 'addition':
					// 90% success rate for new plant additions
					if (Math.random() > 0.10) resolve()
					else reject(new Error('Plant addition validation failed'))
					break
					
				case 'removal':
					// 98% success rate for removals
					if (Math.random() > 0.02) resolve()
					else reject(new Error('Plant removal validation failed'))
					break
					
				default:
					reject(new Error('Unknown operation type'))
			}
		}, 1000)
	})
}
