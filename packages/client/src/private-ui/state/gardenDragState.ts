import { writable } from 'svelte/store'
import type { GardenBed } from '../../lib/garden-bed'
import type { Garden } from '../../lib/garden'
import type {
	GridZoneContext,
	GridDragState as BaseGridDragState,
	GridValidationContext as BaseGridValidationContext,
	GridAsyncValidationFunction as BaseGridAsyncValidationFunction,
	GridPendingOperation as BaseGridPendingOperation,
	GridPlacementRequestDetails,
	GridRemovalRequestDetails,
	GridCloningRequestDetails,
} from '../../private/grid/grid-drag-state'
import {
	isGridPendingOperation,
	isGridItemRemovalOperation,
} from '../../private/grid/grid-drag-state'
import type {
	WithVisualPresentation,
	GridPlacement,
} from '../../private/grid/grid-placement'

// Generic type aliases
export type ExistingGardenItem<T extends WithVisualPresentation> = GridPlacement<T>
export type GardenDragState<T extends WithVisualPresentation> = BaseGridDragState<T>
export type GardenPendingOperation<T extends WithVisualPresentation> =
	BaseGridPendingOperation<T>
export type PlacementRequestDetails<T> = GridPlacementRequestDetails<T>
export type RemovalRequestDetails<T> = GridRemovalRequestDetails<T>
export type CloningRequestDetails<T> = GridCloningRequestDetails<T>

export interface GardenZoneContext<T extends WithVisualPresentation>
	extends GridZoneContext<T>,
		Omit<GardenBed, 'placements' | 'id' | 'width' | 'height'> {
	id: string // ID of the GardenBed
	waterLevel: number
	sunLevel: number
}

export type GardenValidationContext<T extends WithVisualPresentation> =
	BaseGridValidationContext<T, GardenZoneContext<T>> & {
		applicationContext?: { garden: Garden }
	}

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
