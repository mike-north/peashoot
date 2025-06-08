import { writable } from 'svelte/store'
import type { ItemInZone, IDragState, PendingOperation } from './types'
import type { WithId } from '../../lib/entities/with-id'

export const pendingOperations = writable<PendingOperation<WithId>[]>([])

export const dragState = writable<IDragState<WithId, ItemInZone<WithId>>>({
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
	TItem extends WithId,
	TExisting extends ItemInZone<TItem>,
>(state: IDragState<TItem, TExisting>): boolean {
	return (
		(state.draggedExistingItem !== null || state.draggedNewItem !== null) &&
		(state.dragPosition.x !== 0 || state.dragPosition.y !== 0)
	)
}

export function isDraggingExistingItem<
	TItem extends WithId,
	TExisting extends ItemInZone<TItem>,
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
	TItem extends WithId,
	TExisting extends ItemInZone<TItem>,
>(
	state: IDragState<TItem, TExisting>,
): state is IDragState<TItem, TExisting> & { draggedNewItem: TItem } {
	return state.dragSourceType === 'new-item' && state.draggedNewItem !== null
}

export function getDraggedItemInfo<
	TItem extends WithId,
	TExisting extends ItemInZone<TItem>,
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
