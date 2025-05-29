import { writable } from 'svelte/store'
import type {
	DraggableItem,
	ExistingDraggableItem,
	DropZoneContext,
	IDragState,
	ValidationContext,
	PendingOperation,
} from '../../private-lib/dnd/types'
import type { AsyncValidationFunction } from '../../private-lib/dnd/validation'

// TODO: Verify these paths when Plant and GardenBed types are fully available/refactored
import type { Plant } from '../../private-lib/plant'
import { isPlant } from '../../private-lib/plant'
import type { PlantPlacement } from '../../private-lib/plant-placement'
import type { GardenBed } from '../../private-lib/garden-bed'
import type { Garden } from '../../private-lib/garden' // Ensure Garden type is imported for applicationContext
// import type { Garden } from '../../lib/garden'; // If a full Garden model is needed for context

// Plant already implements DraggableItem (has id, and plantingDistanceInFeet serves as size)
// So we can use Plant directly as our draggable item type

// Define what an existing/placed item looks like in the garden (PlantPlacement)
export interface ExistingGardenItem
	extends ExistingDraggableItem<Plant>,
		Omit<PlantPlacement, 'plantId' | 'id'> {
	id: string // ID of the PlantPlacement instance
	itemData: Plant // The Plant being placed
	x: number // from PlantPlacement
	y: number // from PlantPlacement
}

// Define the context for a garden drop zone (GardenBed)
export interface GardenZoneContext
	extends DropZoneContext,
		Omit<GardenBed, 'plantPlacements' | 'id'> {
	id: string // ID of the GardenBed
	plantPlacements: ExistingGardenItem[] // Use the specialized ExistingGardenItem
}

// Specialize the main drag state for the garden app
export type GardenDragState = IDragState<Plant, ExistingGardenItem>

// Specialize the validation context for the garden app
export type GardenValidationContext = ValidationContext<Plant, GardenZoneContext> & {
	applicationContext?: { garden: Garden }
}

// Define a validation result type for garden-specific validation
export interface ValidationResult {
	isValid: boolean
	error?: string
}

// Define GardenAsyncValidationFunction as returning ValidationResult instead of void
export type GardenAsyncValidationFunction = (
	context: GardenValidationContext,
) => Promise<ValidationResult>

// Specialize the pending operation for the garden app
export type GardenPendingOperation = PendingOperation<Plant>

export function isGardenPendingOperation(
	operation: PendingOperation<DraggableItem>,
): operation is GardenPendingOperation {
	return isPlant(operation.item)
}

export function isGardenItemRemovalOperation(
	op: PendingOperation<DraggableItem>,
): op is GardenPendingOperation {
	return isGardenPendingOperation(op) && op.type === 'removal'
}

// Helper function to get size from Plant (maps plantingDistanceInFeet to size)
export function getPlantSize(plant: Plant): number {
	return plant.plantingDistanceInFeet
}

// Function to adapt PlantPlacement to ExistingGardenItem
export function plantPlacementToExistingGardenItem(
	pp: PlantPlacement,
	plant: Plant, // Plant data must be provided separately since PlantPlacement only has plantId
): ExistingGardenItem {
	return {
		id: pp.id,
		x: pp.x,
		y: pp.y,
		itemData: plant,
		size: getPlantSize(plant),
	}
}

// Helper to create a mock ExistingGardenItem from just a Plant (for drag previews)
export function plantToExistingGardenItem(
	plant: Plant,
	x = 0,
	y = 0,
): ExistingGardenItem {
	return {
		id: `temp-${plant.id}`,
		x,
		y,
		itemData: plant,
		size: getPlantSize(plant),
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

// Function to convert ExistingGardenItem back to PlantPlacement
export function existingGardenItemToPlantPlacement(
	egi: ExistingGardenItem,
): PlantPlacement {
	return {
		id: egi.id,
		x: egi.x,
		y: egi.y,
		plantId: egi.itemData.id,
	}
}

// Request Detail Types for Garden <-> GardenView communication

export interface PlacementRequestDetails {
	itemData: Plant
	targetZoneId: string
	x: number
	y: number
	originalInstanceId?: string // For moves
	sourceZoneId?: string // For moves
	operationType: 'item-add-to-zone' | 'item-move-within-zone' | 'item-move-across-zones'
}

export interface RemovalRequestDetails {
	itemData: Plant
	instanceId: string
	sourceZoneId: string
	operationType: 'item-remove-from-zone'
}

export interface CloningRequestDetails {
	itemDataToClone: Plant
	sourceOriginalZoneId: string // Zone of the item being cloned
	targetCloneZoneId: string // Zone where the clone will be placed
	sourceOriginalX: number // Original item's X
	sourceOriginalY: number // Original item's Y
	targetCloneX: number // Target X for the clone
	targetCloneY: number // Target Y for the clone
	operationType: 'item-clone-in-zone'
}
