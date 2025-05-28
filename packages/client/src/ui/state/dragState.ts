// import { writable } from 'svelte/store' // No longer needed here
// // import type { PlantPlacement } from '../../lib/plant-placement' // To be made generic
// // import type { Plant } from '../../lib/plant' // To be made generic

// // Generic type for the item being dragged. This is the core data.
// export type DraggableItem = Record<string, any> & { id: string; size?: number } // Must have an ID, size is optional

// // Generic type for an item that exists in a zone (e.g., a placed item).
// // It must contain the core DraggableItem data.
// export type ExistingDraggableItem<TItem extends DraggableItem> = Record<string, any> & {
// 	id: string // ID of the placed instance
// 	itemData: TItem // The actual draggable item data
// 	x?: number // Optional coordinates if relevant to the zone
// 	y?: number
// 	size?: number // Often same as itemData.size but could differ
// }

// // Generic type for data associated with a drop zone
// export type DropZoneContext = Record<string, any> & { id: string } // Must have an ID

// // Types of drag sources
// export type DragSourceType = 'existing-item' | 'new-item'

// // Types of drop targets
// export type DropTargetType = 'drop-zone' | 'delete-zone' // Renamed for clarity

// // Async validation states
// export type ValidationState = 'pending' | 'success' | 'error'

// // Operation types for validation
// export type OperationType =
// 	| 'item-move-within-zone'
// 	| 'item-move-across-zones'
// 	| 'item-add-to-zone'
// 	| 'item-remove-from-zone'
// 	| 'item-clone-in-zone'

// // Validation context for async operations
// export interface ValidationContext<
// 	TItem extends DraggableItem,
// 	TZoneCtx extends DropZoneContext,
// > {
// 	operationType: OperationType
// 	item: TItem // The core item data (e.g., Plant)
// 	itemInstanceId?: string // ID of the item *instance* if it's an existing one (e.g., PlantPlacement.id)
// 	sourceZoneId?: string
// 	sourceZoneContext?: TZoneCtx // Context data of the source zone (e.g., GardenBed)
// 	targetZoneId?: string
// 	targetZoneContext?: TZoneCtx // Context data of the target zone
// 	sourceX?: number | undefined
// 	sourceY?: number | undefined
// 	targetX?: number | undefined
// 	targetY?: number | undefined
// 	// Application-specific context can be added by extending this interface
// 	// Example: applicationContext?: { garden?: Garden }
// }

// // Validation function type
// export type AsyncValidationFunction<
// 	TItem extends DraggableItem,
// 	TZoneCtx extends DropZoneContext,
// > = (context: ValidationContext<TItem, TZoneCtx>) => Promise<void>

// // Pending operation for async validation
// export interface PendingOperation<TItem extends DraggableItem> {
// 	id: string // ID of the pending operation itself
// 	type: 'placement' | 'removal' // More abstract: 'add', 'update', 'remove'
// 	zoneId?: string // Target zone for placements
// 	x?: number // Target x for placements
// 	y?: number // Target y for placements
// 	size?: number // Size of the item in the operation
// 	item: TItem // The core item data
// 	state: ValidationState
// 	timestamp: number
// }

// // Enhanced drag state
// export interface IDragState<
// 	TItem extends DraggableItem,
// 	TExisting extends ExistingDraggableItem<TItem>,
// > {
// 	draggedExistingItem: TExisting | null
// 	draggedNewItem: TItem | null // This is the core item data for a new item
// 	draggedItemEffectiveSize: number // Actual size being used for drag visuals/collision
// 	dragSourceType: DragSourceType
// 	dragOffset: { x: number; y: number }
// 	dragPosition: { x: number; y: number }
// 	isCloneMode: boolean
// 	highlightedCell: { x: number; y: number } | null // Grid-specific, consider abstracting if needed
// 	sourceZoneId: string | null
// 	targetZoneId: string | null
// 	targetType: DropTargetType | null
// }

// export const pendingOperations = writable<PendingOperation<DraggableItem>[]>([]) // Moved

// export const dragState = writable<
// 	IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
// >({
// 	draggedExistingItem: null,
// 	draggedNewItem: null,
// 	draggedItemEffectiveSize: 1,
// 	dragSourceType: 'existing-item',
// 	dragOffset: { x: 0, y: 0 },
// 	dragPosition: { x: 0, y: 0 },
// 	highlightedCell: null,
// 	sourceZoneId: null,
// 	targetZoneId: null,
// 	targetType: null,
// 	isCloneMode: false,
// }) // Moved

// export function isDragStatePopulated<
// 	TItem extends DraggableItem,
// 	TExisting extends ExistingDraggableItem<TItem>,
// >(state: IDragState<TItem, TExisting>): boolean {
// 	return (
// 		(state.draggedExistingItem !== null || state.draggedNewItem !== null) &&
// 		(state.dragPosition.x !== 0 || state.dragPosition.y !== 0)
// 	)
// } // Moved

// export function isDraggingExistingItem<
// 	TItem extends DraggableItem,
// 	TExisting extends ExistingDraggableItem<TItem>,
// >(
// 	state: IDragState<TItem, TExisting>,
// ): state is IDragState<TItem, TExisting> & {
// 	draggedExistingItem: TExisting
// 	sourceZoneId: string
// } {
// 	return (
// 		state.dragSourceType === 'existing-item' &&
// 		state.draggedExistingItem !== null &&
// 		state.sourceZoneId !== null
// 	)
// } // Moved

// export function isDraggingNewItem<
// 	TItem extends DraggableItem,
// 	TExisting extends ExistingDraggableItem<TItem>,
// >(
// 	state: IDragState<TItem, TExisting>,
// ): state is IDragState<TItem, TExisting> & { draggedNewItem: TItem } {
// 	return state.dragSourceType === 'new-item' && state.draggedNewItem !== null
// } // Moved

// export function getDraggedItemInfo<
// 	TItem extends DraggableItem,
// 	TExisting extends ExistingDraggableItem<TItem>,
// >(state: IDragState<TItem, TExisting>): { item: TItem; effectiveSize: number } | null {
// 	if (isDraggingExistingItem(state)) {
// 		// TExisting is guaranteed to have itemData of type TItem
// 		return {
// 			item: state.draggedExistingItem.itemData,
// 			effectiveSize:
// 				state.draggedExistingItem.size ?? state.draggedExistingItem.itemData.size ?? 1,
// 		}
// 	} else if (isDraggingNewItem(state)) {
// 		return {
// 			item: state.draggedNewItem,
// 			effectiveSize: state.draggedNewItem.size ?? 1,
// 		}
// 	}
// 	return null
// } // Moved

// export function addPendingOperation<TItem extends DraggableItem>(
// 	operation: Omit<PendingOperation<TItem>, 'id' | 'timestamp'>,
// ): string {
// 	const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
// 	const pendingOp: PendingOperation<TItem> = {
// 		...(operation as PendingOperation<TItem>),
// 		id,
// 		timestamp: Date.now(),
// 	}
// 	pendingOperations.update(
// 		(ops) => [...ops, pendingOp] as PendingOperation<DraggableItem>[],
// 	)
// 	return id
// } // Moved

// export function updatePendingOperation(id: string, state: ValidationState) {
// 	pendingOperations.update((ops) =>
// 		ops.map((op) => (op.id === id ? { ...op, state } : op)),
// 	)
// } // Moved

// export function removePendingOperation(id: string) {
// 	pendingOperations.update((ops) => ops.filter((op) => op.id !== id))
// } // Moved

// export const defaultAsyncValidation: AsyncValidationFunction<
// 	DraggableItem,
// 	DropZoneContext
// > = async (context: ValidationContext<DraggableItem, DropZoneContext>) => {
// 	return new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			// For now, always resolve to allow operations
// 			console.log('Async validation called with context:', context)
// 			resolve()
// 			/* switch (context.operationType) {
// 				case 'item-move-within-zone':
// 					if (Math.random() > 0.05) resolve()
// 					else reject(new Error('Move failed'))
// 					break
// 				case 'item-move-across-zones':
// 					if (Math.random() > 0.15) resolve()
// 					else reject(new Error('Move failed'))
// 					break
// 				case 'item-add-to-zone':
// 					if (Math.random() > 0.1) resolve()
// 					else reject(new Error('Add failed'))
// 					break
// 				case 'item-clone-in-zone':
// 					if (Math.random() > 0.12) resolve()
// 					else reject(new Error('Clone failed'))
// 					break
// 				case 'item-remove-from-zone':
// 					if (Math.random() > 0.02) resolve()
// 					else reject(new Error('Remove failed'))
// 					break
// 				default:
// 					reject(new Error('Unknown operation'))
// 			} */
// 		}, 200) // Shortened timeout for quicker feedback
// 	})
// } // Moved

// Re-export core types and state from the new dnd library
export * from '../../lib/dnd/types'
export * from '../../lib/dnd/state'
export * from '../../lib/dnd/validation'

// --- Application-Specific Specializations (Example for Garden App) ---
// This section demonstrates how the garden application would specialize these generic types.
// In a real refactor, this would likely live in a separate file like `gardenDragState.ts` or similar.

/*
import type { Plant, PlantPlacement } from '../../lib/plant'; // Assuming these are defined
import type { GardenBed } from '../../lib/garden-bed';    // Assuming this is defined

// 1. Define the core draggable item for the garden app (Plant data)
export interface GardenItem extends DraggableItem {
    name: string;
    icon: string;
    plantFamily: { name: string; colorVariant: string };
    // other plant-specific properties...
}

// 2. Define what an existing/placed item looks like in the garden (PlantPlacement)
export interface ExistingGardenItem extends ExistingDraggableItem<GardenItem> {
    itemData: GardenItem; // This is the Plant
    // PlantPlacement might have additional properties like specific x, y in a bed
}

// 3. Define the context for a garden drop zone (GardenBed)
export interface GardenZoneContext extends DropZoneContext {
    width: number;
    height: number;
    plantPlacements: ExistingGardenItem[];
    // other bed-specific properties...
}

// 4. Specialize the main drag state for the garden app
export type GardenDragState = IDragState<GardenItem, ExistingGardenItem>;

// 5. Specialize the validation context for the garden app
export type GardenValidationContext = ValidationContext<GardenItem, GardenZoneContext> & {
    applicationContext?: { garden: Garden }; // Add the whole garden model if needed
};

// 6. Specialize the pending operation for the garden app
export type GardenPendingOperation = PendingOperation<GardenItem>;

// Function to adapt Plant to GardenItem (example)
export function plantToGardenItem(plant: Plant): GardenItem {
    return { ...plant, size: plant.size ?? 1 };
}

// Function to adapt PlantPlacement to ExistingGardenItem (example)
export function plantPlacementToExistingGardenItem(pp: PlantPlacement): ExistingGardenItem {
    return { ...pp, itemData: plantToGardenItem(pp.plantTile), size: pp.plantTile.size ?? 1 };
}

// Initial state for garden app would use these specialized types:
// export const gardenAppDragState = writable<GardenDragState>({
//     draggedExistingItem: null,
//     draggedNewItem: null,
//     draggedItemEffectiveSize: 1,
//     // ... other initial values
// });
*/
