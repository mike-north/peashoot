import type { ValidationResult } from '../../lib/types/validation'
import type {
	DropZoneContext,
	ValidationContext,
	PendingOperation,
	DragSourceType,
	DropTargetType,
} from '../dnd/types'
import type { GridPlacement, GridPlaceable } from './grid-placement'
import type { WithId } from '../../lib/entities/with-id'
import type { Item, ItemPlacement } from '@peashoot/types'

/**
 * Context for a grid-based drop zone
 */
export interface GridZoneContext<T extends GridPlaceable> extends DropZoneContext {
	width: number
	height: number
	placements: GridPlacement<T>[]
}

/**
 * Grid-specific drag state - specialized for GridPlacement
 */
export interface GridDragState<T extends Item> {
	draggedExistingItem: ItemPlacement | null
	draggedNewItem: T | null // This is the core item data for a new item
	draggedItemEffectiveSize: number // Actual size being used for drag visuals/collision
	dragSourceType: DragSourceType
	dragOffset: { x: number; y: number }
	dragPosition: { x: number; y: number }
	isCloneMode: boolean
	highlightedCell: { x: number; y: number } | null
	sourceZoneId: string | null
	targetZoneId: string | null
	targetType: DropTargetType | null
}

/**
 * Grid-specific validation context
 */
export type GridValidationContext<
	T extends GridPlaceable,
	TZoneCtx extends GridZoneContext<T> = GridZoneContext<T>,
> = ValidationContext<T, TZoneCtx>

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
 * Check if a pending operation is for a specific item type
 */
export function isGridPendingOperation<T extends GridPlaceable>(
	operation: PendingOperation<WithId>,
	typeGuard: (item: unknown) => item is T,
): operation is GridPendingOperation<T> {
	return typeGuard(operation.item)
}

/**
 * Check if a pending operation is a removal operation
 */
export function isGridItemRemovalOperation<T extends GridPlaceable>(
	op: PendingOperation<WithId>,
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

// Grid-specific drag state utility functions

export function isGridDragStatePopulated<T extends Item>(
	state: GridDragState<T>,
): boolean {
	return (
		(state.draggedExistingItem !== null || state.draggedNewItem !== null) &&
		(state.dragPosition.x !== 0 || state.dragPosition.y !== 0)
	)
}

export function isGridDraggingExistingItem<T extends Item>(
	state: GridDragState<T>,
): state is GridDragState<T> & {
	draggedExistingItem: GridPlacement<T>
	sourceZoneId: string
} {
	return (
		state.dragSourceType === 'existing-item' &&
		state.draggedExistingItem !== null &&
		state.sourceZoneId !== null
	)
}

export function isGridDraggingNewItem<T extends Item>(
	state: GridDragState<T>,
): state is GridDragState<T> & { draggedNewItem: T } {
	return state.dragSourceType === 'new-item' && state.draggedNewItem !== null
}

export function getGridDraggedItemInfo<T extends Item>(
	state: GridDragState<T>,
): { item: T; effectiveSize: number } | null {
	if (isGridDraggingExistingItem(state)) {
		return {
			item: state.draggedExistingItem.item,
			effectiveSize: state.draggedItemEffectiveSize,
		}
	} else if (isGridDraggingNewItem(state)) {
		return {
			item: state.draggedNewItem,
			effectiveSize: state.draggedItemEffectiveSize,
		}
	}
	return null
}
