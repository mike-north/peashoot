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

// Function to adapt Plant to GardenItem
export function plantToGardenItem(plant: Plant): GardenItem {
	// Ensure all properties of GardenItem are mapped. Add id if not directly on plant.
	// If Plant already mostly conforms to DraggableItem & GardenItem specific fields, this is simpler.
	return {
		...plant,
		id: plant.id, // Assuming Plant has an id
		size: plant.size ?? 1,
		// Ensure plantFamily is correctly structured if different on Plant type
		plantFamily: plant.plantFamily || { name: 'Unknown', colorVariant: 'default' },
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
		size: plantTile.size ?? 1, // Or pp.size if it can differ from plantTile.size
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
	if (!egi.itemData)
		throw new Error('ExistingGardenItem must have itemData to convert to PlantPlacement')

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
