import type { Writable } from 'svelte/store'
import { dragState } from './state'
import type { DraggableItem, ExistingDraggableItem, IDragState } from './types'
// import type { GridPlaceable } from '../grid/grid-placement'

// Type alias for what the global dragState store holds for its "existing item" part.
type GlobalStoreExistingItem = ExistingDraggableItem<DraggableItem>

export class DragManager<TItem extends DraggableItem> {
	constructor(private getItemSize: (item: TItem) => number = () => 1) {}

	// Start dragging an existing item from a zone
	startDraggingExistingItem(
		existingItem: ExistingDraggableItem<TItem>,
		sourceZoneId: string,
		event: MouseEvent,
	) {
		const isCloneMode = event.metaKey || event.altKey
		const effectiveSize = this.getItemSize(existingItem.item)

		dragState.update((s: IDragState<DraggableItem, GlobalStoreExistingItem>) => ({
			...s,
			draggedExistingItem: existingItem,
			draggedNewItem: null,
			draggedItemEffectiveSize: effectiveSize,
			dragSourceType: 'existing-item',
			dragOffset: { x: event.clientX, y: event.clientY },
			dragPosition: { x: event.clientX, y: event.clientY },
			highlightedCell: null,
			sourceZoneId,
			targetZoneId: null,
			targetType: null,
			isCloneMode,
		}))
	}

	// Start dragging a new item from a source (e.g., toolbar)
	startDraggingNewItem(newItemData: TItem, event: MouseEvent | TouchEvent) {
		const effectiveSize = this.getItemSize(newItemData)
		const { clientX, clientY } = 'touches' in event ? event.touches[0] : event

		dragState.update((s) => ({
			...s,
			draggedExistingItem: null,
			draggedNewItem: newItemData,
			draggedItemEffectiveSize: effectiveSize,
			dragSourceType: 'new-item',
			dragOffset: { x: clientX, y: clientY },
			dragPosition: { x: clientX, y: clientY },
			highlightedCell: null,
			sourceZoneId: null,
			targetZoneId: null,
			targetType: null,
			isCloneMode: false,
		}))
	}

	// Clean up drag state
	cleanup() {
		dragState.update((s) => ({
			...s,
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
		}))
	}

	// Get the current drag state (remains useful for non-Svelte parts or imperative logic)
	getCurrentDragState(): Writable<
		IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
	> {
		return dragState // This still returns the writable store itself
	}
}

// Global instance - TItem will be DraggableItem.
// The dnd system itself doesn't care about the "actual" size for its core logic.
// It provides a default of 1 for any drag visuals or temporary state.
// The grid or other drop targets will determine actual placement constraints.
export const dragManager = new DragManager<DraggableItem>()
