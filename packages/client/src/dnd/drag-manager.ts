import type { Writable } from 'svelte/store'
import { dragState } from './state'
import type { DraggableItem, ExistingDraggableItem, IDragState } from './types'

// Type alias for what the global dragState store holds for its "existing item" part.
type GlobalStoreExistingItem = ExistingDraggableItem<DraggableItem>

export class DragManager<TItem extends DraggableItem> {
	private getItemSize: (item: TItem) => number

	constructor(getItemSize?: (item: TItem) => number) {
		// Provide a default getItemSize if none is supplied
		this.getItemSize =
			getItemSize ||
			((item: TItem) => {
				if (typeof item === 'object' && 'size' in item) {
					const sizeValue = (item as { size?: unknown }).size
					if (typeof sizeValue === 'number') {
						return sizeValue
					}
				}
				return 1
			})
	}

	// Start dragging an existing item from a zone
	startDraggingExistingItem(
		existingItem: ExistingDraggableItem<TItem>,
		sourceZoneId: string,
		event: MouseEvent,
	) {
		const isCloneMode = event.metaKey || event.altKey

		// Calculate the effective size based on the item type
		let effectiveSize = 1 // Default fallback
		effectiveSize = this.getItemSize(existingItem.item)

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
	startDraggingNewItem(newItemData: TItem, event: MouseEvent) {
		// Calculate the effective size based on the item type
		let effectiveSize = 1 // Default fallback
		effectiveSize = this.getItemSize(newItemData)

		dragState.update((s) => ({
			...s,
			draggedExistingItem: null,
			draggedNewItem: newItemData,
			draggedItemEffectiveSize: effectiveSize,
			dragSourceType: 'new-item',
			dragOffset: { x: event.clientX, y: event.clientY },
			dragPosition: { x: event.clientX, y: event.clientY },
			highlightedCell: null,
			sourceZoneId: null,
			targetZoneId: null,
			targetType: null,
			isCloneMode: false, // Clone mode doesn't apply to new items from a toolbar
		}))
	}

	// Clean up drag state
	cleanup() {
		dragState.update((s) => ({
			...s,
			draggedExistingItem: null,
			draggedNewItem: null,
			draggedItemEffectiveSize: 1,
			dragSourceType: 'existing-item', // Default back
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

// Global instance - TItem will be DraggableItem. Consumer must provide getItemSize.
// Example for Plant: (item) => item.plantingDistanceInFeet
export const dragManager = new DragManager<DraggableItem>((item) => {
	if (
		'plantingDistanceInFeet' in item &&
		typeof item.plantingDistanceInFeet === 'number'
	) {
		return item.plantingDistanceInFeet
	}
	if ('size' in item && typeof item.size === 'number') {
		return item.size
	}
	return 1
})
