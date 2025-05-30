import { writable } from 'svelte/store'
import type { TileVisualPresentation } from '../../private-lib/plant'
import type { GridPlaceable } from '../../private-lib/grid-placement'
import type { GardenBed } from '../../private-lib/garden-bed'
import type { Garden } from '../../private-lib/garden'
import type {
	ExistingGridItem,
	GridZoneContext,
	GridDragState as BaseGridDragState,
	GridValidationContext as BaseGridValidationContext,
	GridAsyncValidationFunction as BaseGridAsyncValidationFunction,
	GridPendingOperation as BaseGridPendingOperation,
	GridPlacementRequestDetails,
	GridRemovalRequestDetails,
	GridCloningRequestDetails,
} from '../../private-lib/dnd/grid-drag-state'
import {
	isGridPendingOperation,
	isGridItemRemovalOperation,
	gridPlacementToExistingGridItem,
	existingGridItemToGridPlacement,
} from '../../private-lib/dnd/grid-drag-state'

// Generic constraint: must be placeable and have a presentation
export interface WithVisualPresentation extends GridPlaceable {
	presentation: TileVisualPresentation
}

// Generic type aliases
export type ExistingGardenItem<T extends WithVisualPresentation> = ExistingGridItem<T>
export type GardenDragState<T extends WithVisualPresentation> = BaseGridDragState<T>
export type GardenPendingOperation<T extends WithVisualPresentation> =
	BaseGridPendingOperation<T>
export type PlacementRequestDetails<T> = GridPlacementRequestDetails<T>
export type RemovalRequestDetails<T> = GridRemovalRequestDetails<T>
export type CloningRequestDetails<T> = GridCloningRequestDetails<T>

export interface GardenZoneContext<T extends WithVisualPresentation>
	extends GridZoneContext<T>,
		Omit<GardenBed, 'plantPlacements' | 'id' | 'width' | 'height'> {
	id: string // ID of the GardenBed
	waterLevel: number
	sunLevel: number
}

export type GardenValidationContext<T extends WithVisualPresentation> =
	BaseGridValidationContext<T, GardenZoneContext<T>> & {
		applicationContext?: { garden: Garden }
	}

export type { ValidationResult } from '../../private-lib/dnd/grid-drag-state'

export type GardenAsyncValidationFunction<T extends WithVisualPresentation> =
	BaseGridAsyncValidationFunction<T, GardenZoneContext<T>>

export function isWithVisualPresentation(item: unknown): item is WithVisualPresentation {
	return (
		typeof item === 'object' &&
		item !== null &&
		'size' in item &&
		'presentation' in item &&
		!!item.presentation &&
		typeof item.presentation === 'object' &&
		'iconPath' in item.presentation &&
		typeof item.presentation.iconPath === 'string'
	)
}

// Generic type guards
export function isGardenPendingOperation<T extends WithVisualPresentation>(
	operation: BaseGridPendingOperation<T>,
): operation is GardenPendingOperation<T> {
	return isGridPendingOperation(operation, isWithVisualPresentation)
}

export function isGardenItemRemovalOperation<T extends WithVisualPresentation>(
	op: unknown,
): op is GardenPendingOperation<T> {
	return isGridItemRemovalOperation(
		op as BaseGridPendingOperation<T>,
		isWithVisualPresentation,
	)
}

// The following helpers must be provided by the consumer (e.g., a Plant adapter):
// - getItemSize<T>(item: T): number
// - toWithVisualPresentation<T>(item: T): WithVisualPresentation
// - gridPlacementToWithVisualPresentation<T>(placement: GridPlacement<T>): GridPlacement<WithVisualPresentation>
// - etc.

// Example: default store factory (consumer should provide initial value)
export function createGardenAppDragState<T extends WithVisualPresentation>() {
	return writable<GardenDragState<T>>({
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
}

// For compatibility: export the Plant version as default (to be replaced by adapter pattern)
// import type { Plant } from '../../private-lib/plant'
// export type PlantGardenDragState = GardenDragState<Plant>
// export const gardenAppDragState = createGardenAppDragState<Plant>()

// Re-export grid placement helpers for consumers
export { gridPlacementToExistingGridItem, existingGridItemToGridPlacement }
