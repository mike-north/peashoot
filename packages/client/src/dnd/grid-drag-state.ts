import type {
	DraggableItem,
	ExistingDraggableItem,
	DropZoneContext,
	IDragState,
	ValidationContext,
	PendingOperation,
} from './types'
import type { GridPlacement, GridPlaceable } from '../grid/grid-placement'

/**
 * Represents an item that has been placed on a grid and can be dragged.
 * This bridges GridPlacement with the drag-and-drop system.
 */
export interface ExistingGridItem<T extends GridPlaceable>
	extends ExistingDraggableItem<T> {
	x: number
	y: number
	size: number
}

/**
 * Context for a grid-based drop zone
 */
export interface GridZoneContext<T extends GridPlaceable> extends DropZoneContext {
	width: number
	height: number
	placements: GridPlacement<T>[]
}

/**
 * Grid-specific drag state
 */
export type GridDragState<T extends GridPlaceable> = IDragState<T, ExistingGridItem<T>>

/**
 * Grid-specific validation context
 */
export type GridValidationContext<
	T extends GridPlaceable,
	TZoneCtx extends GridZoneContext<T> = GridZoneContext<T>,
> = ValidationContext<T, TZoneCtx>

/**
 * Result of validation
 */
export interface ValidationResult {
	isValid: boolean
	error?: string
}

/**
 * Grid validation function type
 */
export type GridAsyncValidationFunction<
	T extends GridPlaceable,
	TZoneCtx extends GridZoneContext<T> = GridZoneContext<T>,
> = (context: GridValidationContext<T, TZoneCtx>) => Promise<ValidationResult>

/**
 * Grid-specific pending operation
 */
export type GridPendingOperation<T extends GridPlaceable> = PendingOperation<T>

/**
 * Convert a GridPlacement to ExistingGridItem for drag operations
 */
export function gridPlacementToExistingGridItem<T extends GridPlaceable>(
	placement: GridPlacement<T>,
	sourceZoneId: string,
): ExistingGridItem<T> {
	return {
		id: placement.id,
		x: placement.x,
		y: placement.y,
		size: placement.size,
		itemData: placement.data,
		sourceZoneId,
	}
}

/**
 * Convert ExistingGridItem to GridPlacement
 */
export function existingGridItemToGridPlacement<T extends GridPlaceable>(
	item: ExistingGridItem<T>,
): GridPlacement<T> {
	return {
		id: item.id,
		x: item.x,
		y: item.y,
		size: item.size,
		data: item.itemData,
	}
}

/**
 * Check if a pending operation is for a specific item type
 */
export function isGridPendingOperation<T extends GridPlaceable>(
	operation: PendingOperation<DraggableItem>,
	typeGuard: (item: unknown) => item is T,
): operation is GridPendingOperation<T> {
	return typeGuard(operation.item)
}

/**
 * Check if a pending operation is a removal operation
 */
export function isGridItemRemovalOperation<T extends GridPlaceable>(
	op: PendingOperation<DraggableItem>,
	typeGuard: (item: unknown) => item is T,
): op is GridPendingOperation<T> {
	return isGridPendingOperation(op, typeGuard) && op.type === 'removal'
}

// Request Detail Types for Grid <-> UI communication

export interface GridPlacementRequestDetails<T> {
	itemData: T
	targetZoneId: string
	x: number
	y: number
	originalInstanceId?: string // For moves
	sourceZoneId?: string // For moves
	operationType: 'item-add-to-zone' | 'item-move-within-zone' | 'item-move-across-zones'
}

export interface GridRemovalRequestDetails<T> {
	itemData: T
	instanceId: string
	sourceZoneId: string
	operationType: 'item-remove-from-zone'
}

export interface GridCloningRequestDetails<T> {
	itemDataToClone: T
	sourceOriginalZoneId: string // Zone of the item being cloned
	targetCloneZoneId: string // Zone where the clone will be placed
	sourceOriginalX: number // Original item's X
	sourceOriginalY: number // Original item's Y
	targetCloneX: number // Target X for the clone
	targetCloneY: number // Target Y for the clone
	operationType: 'item-clone-in-zone'
}
