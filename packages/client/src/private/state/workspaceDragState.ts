import { writable } from 'svelte/store'
import type { Zone } from '../../lib/entities/zone'
import type { Workspace } from '../../lib/entities/workspace'
import type {
	GridZoneContext,
	GridDragState,
	GridValidationContext,
	GridAsyncValidationFunction,
	GridPendingOperation,
	GridPlacementRequestDetails,
	GridRemovalRequestDetails,
	GridCloningRequestDetails,
} from '../grid/grid-drag-state'
import {
	isGridPendingOperation,
	isGridItemRemovalOperation,
} from '../grid/grid-drag-state'
import type { WithVisualPresentation, GridPlacement } from '../grid/grid-placement'

// Generic type aliases
export type ExistingWorkspaceItem<T extends WithVisualPresentation> = GridPlacement<T>
export type WorkspaceDragState<T extends WithVisualPresentation> = GridDragState<T>
export type WorkspacePendingOperation<T extends WithVisualPresentation> =
	GridPendingOperation<T>
export type PlacementRequestDetails<T> = GridPlacementRequestDetails<T>
export type RemovalRequestDetails<T> = GridRemovalRequestDetails<T>
export type CloningRequestDetails<T> = GridCloningRequestDetails<T>

export interface WorkspaceZoneContext<T extends WithVisualPresentation>
	extends GridZoneContext<T>,
		Omit<Zone, 'placements' | 'id' | 'width' | 'height'> {
	id: string // ID of the Zone
	waterLevel: number
	sunLevel: number
}

export type WorkspaceValidationContext<T extends WithVisualPresentation> =
	GridValidationContext<T, WorkspaceZoneContext<T>> & {
		applicationContext?: { workspace: Workspace }
	}

export type WorkspaceAsyncValidationFunction<T extends WithVisualPresentation> =
	GridAsyncValidationFunction<T, WorkspaceZoneContext<T>>

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
export function isWorkspacePendingOperation<T extends WithVisualPresentation>(
	operation: GridPendingOperation<T>,
): operation is WorkspacePendingOperation<T> {
	return isGridPendingOperation(operation, isWithVisualPresentation)
}

export function isWorkspaceItemRemovalOperation<T extends WithVisualPresentation>(
	op: unknown,
): op is WorkspacePendingOperation<T> {
	return isGridItemRemovalOperation(
		op as GridPendingOperation<T>,
		isWithVisualPresentation,
	)
}

export function createWorkspaceAppDragState<T extends WithVisualPresentation>() {
	return writable<WorkspaceDragState<T>>({
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