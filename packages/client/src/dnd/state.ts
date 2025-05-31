import { writable } from 'svelte/store'
import type {
	DraggableItem,
	ExistingDraggableItem,
	IDragState,
	PendingOperation,
} from './types'

export const pendingOperations = writable<PendingOperation<DraggableItem>[]>([])

export const dragState = writable<
	IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
>({
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

export function isDragStatePopulated<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
>(state: IDragState<TItem, TExisting>): boolean {
	return (
		(state.draggedExistingItem !== null || state.draggedNewItem !== null) &&
		(state.dragPosition.x !== 0 || state.dragPosition.y !== 0)
	)
}

export function isDraggingExistingItem<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
>(
	state: IDragState<TItem, TExisting>,
): state is IDragState<TItem, TExisting> & {
	draggedExistingItem: TExisting
	sourceZoneId: string
} {
	return (
		state.dragSourceType === 'existing-item' &&
		state.draggedExistingItem !== null &&
		state.sourceZoneId !== null
	)
}

export function isDraggingNewItem<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
>(
	state: IDragState<TItem, TExisting>,
): state is IDragState<TItem, TExisting> & { draggedNewItem: TItem } {
	return state.dragSourceType === 'new-item' && state.draggedNewItem !== null
}

export function getDraggedItemInfo<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
>(state: IDragState<TItem, TExisting>): { item: TItem; effectiveSize: number } | null {
	if (isDraggingExistingItem(state)) {
		// TExisting is guaranteed to have itemData of type TItem
		return {
			item: state.draggedExistingItem.item,
			effectiveSize: state.draggedItemEffectiveSize,
		}
	} else if (isDraggingNewItem(state)) {
		return {
			item: state.draggedNewItem,
			effectiveSize: state.draggedItemEffectiveSize,
		}
	}
	return null
}
