import { writable } from 'svelte/store'
import type {
	DraggableItem,
	ExistingDraggableItem,
	DropZoneContext,
	IDragState,
	ValidationContext,
	PendingOperation,
} from '../../lib/dnd/types'
import type { AsyncValidationFunction } from '../../lib/dnd/validation'

// TODO: Verify these paths when Plant and GardenBed types are fully available/refactored
import type { Plant } from '../../lib/plant'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { GardenBed } from '../../lib/garden-bed'
import type { Garden } from '../../lib/garden' // Ensure Garden type is imported for applicationContext
// import type { Garden } from '../../lib/garden'; // If a full Garden model is needed for context

// 1. Define the core draggable item for the garden app (Plant data)
export interface GardenItem extends DraggableItem {
	name: string
	icon: string
	plantFamily: { name: string; colorVariant: string }
	// other plant-specific properties...
}

export function isGardenItem(item: DraggableItem): item is GardenItem {
	return 'name' in item && 'icon' in item && 'plantFamily' in item
}

// 2. Define what an existing/placed item looks like in the garden (PlantPlacement)
// It includes the original PlantPlacement props plus itemData (which is GardenItem)
export interface ExistingGardenItem
	extends ExistingDraggableItem<GardenItem>,
		Omit<PlantPlacement, 'plantTile' | 'id'> {
	id: string // ID of the PlantPlacement instance
	itemData: GardenItem // This is the Plant, adapted to GardenItem
	x: number // from PlantPlacement
	y: number // from PlantPlacement
	// size is on itemData (GardenItem) or can be overridden here if instance size differs
}

// 3. Define the context for a garden drop zone (GardenBed)
export interface GardenZoneContext
	extends DropZoneContext,
		Omit<GardenBed, 'plantPlacements' | 'id'> {
	id: string // ID of the GardenBed
	plantPlacements: ExistingGardenItem[] // Use the specialized ExistingGardenItem
	// other bed-specific properties from GardenBed...
}

// 4. Specialize the main drag state for the garden app
export type GardenDragState = IDragState<GardenItem, ExistingGardenItem>

// 5. Specialize the validation context for the garden app
export type GardenValidationContext = ValidationContext<GardenItem, GardenZoneContext> & {
	applicationContext?: { garden: Garden } // Uncommented and defined
}

// Define GardenAsyncValidationFunction as a specialization of the generic one
export type GardenAsyncValidationFunction = AsyncValidationFunction<
	GardenItem,
	GardenZoneContext
>

// 6. Specialize the pending operation for the garden app
export type GardenPendingOperation = PendingOperation<GardenItem>

export function isGardenPendingOperation(
	operation: PendingOperation<DraggableItem>,
): operation is GardenPendingOperation {
	return isGardenItem(operation.item)
}
export function isGardenItemRemovalOperation(
	op: PendingOperation<DraggableItem>,
): op is GardenPendingOperation {
	return isGardenPendingOperation(op) && op.type === 'removal'
}

// Function to adapt Plant to GardenItem
export function plantToGardenItem(plant: Plant): GardenItem {
	// Ensure all properties of GardenItem are mapped. Add id if not directly on plant.
	// If Plant already mostly conforms to DraggableItem & GardenItem specific fields, this is simpler.
	return {
		...plant,
		id: plant.id, // Assuming Plant has an id
		size: plant.size,
		// Ensure plantFamily is correctly structured if different on Plant type
		plantFamily: plant.plantFamily,
	}
}

// Function to adapt PlantPlacement to ExistingGardenItem
export function plantPlacementToExistingGardenItem(
	pp: PlantPlacement,
): ExistingGardenItem {
	const { plantTile, ...restOfPp } = pp
	return {
		...restOfPp, // Includes id, x, y from PlantPlacement
		itemData: plantToGardenItem(plantTile),
		size: plantTile.size, // Or pp.size if it can differ from plantTile.size
	}
}

// Initial state for garden app would use these specialized types:
export const gardenAppDragState = writable<GardenDragState>({
	draggedExistingItem: null,
	draggedNewItem: null,
	draggedItemEffectiveSize: 1,
	dragSourceType: 'existing-item',
	dragOffset: { x: 0, y: 0 },
	dragPosition: { x: 0, y: 0 },
	highlightedCell: null,
	sourceZoneId: null,
	targetZoneId: null,
	targetType: null,
	isCloneMode: false,
})

// Function that might have been in gardenDragStateTypes.ts
// If this was used, ensure it's correctly defined or remove if not needed.
export function existingGardenItemToPlantPlacement(
	egi: ExistingGardenItem,
): PlantPlacement {
	const plantTile: Plant = {
		id: egi.itemData.id,
		name: egi.itemData.name,
		icon: egi.itemData.icon,
		size: egi.itemData.size ?? 1,
		plantFamily: egi.itemData.plantFamily,
	}

	return {
		id: egi.id,
		x: egi.x,
		y: egi.y,
		plantTile: plantTile,
	}
}

// New Request Detail Types for Garden <-> GardenView communication

export interface PlacementRequestDetails {
	itemData: GardenItem
	targetZoneId: string
	x: number
	y: number
	originalInstanceId?: string // For moves
	sourceZoneId?: string // For moves
	// OperationType helps Garden.svelte decide how to construct validation context & which handler to call
	operationType: 'item-add-to-zone' | 'item-move-within-zone' | 'item-move-across-zones'
}

export interface RemovalRequestDetails {
	itemData: GardenItem // Useful for context like item size, though primarily for instanceId
	instanceId: string
	sourceZoneId: string
	operationType: 'item-remove-from-zone' // Explicit for clarity
}

export interface CloningRequestDetails {
	itemDataToClone: GardenItem
	sourceOriginalZoneId: string // Zone of the item being cloned
	targetCloneZoneId: string // Zone where the clone will be placed
	sourceOriginalX: number // Original item's X
	sourceOriginalY: number // Original item's Y
	targetCloneX: number // Target X for the clone
	targetCloneY: number // Target Y for the clone
	operationType: 'item-clone-in-zone' // Explicit for clarity
}
