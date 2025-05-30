import type { Writable } from 'svelte/store'
import { dragState } from './state'
import type { DraggableItem, ExistingDraggableItem, IDragState } from './types'
import { isPlant } from '../plant'
import { getPlantSize } from '../../private-ui/state/gardenDragState'

// Type alias for what the global dragState store holds for its "existing item" part.
type GlobalStoreExistingItem = ExistingDraggableItem<DraggableItem>

export class DragManager<TItem extends DraggableItem> {
	// The maps for registeredDraggableAreas and registeredDropZones are removed.
	// This functionality will be handled by the Svelte component structure and event bubbling/dispatching.

	// Start dragging an existing item from a zone
	startDraggingExistingItem(
		existingItem: ExistingDraggableItem<TItem>,
		sourceZoneId: string,
		event: MouseEvent,
	) {
		const isCloneMode = event.metaKey || event.altKey

		// Calculate the effective size based on the item type
		let effectiveSize = 1 // Default fallback
		if (isPlant(existingItem.itemData)) {
			effectiveSize = getPlantSize(existingItem.itemData)
		} else if (existingItem.size !== undefined) {
			effectiveSize = existingItem.size
		} else if (existingItem.itemData.size !== undefined) {
			effectiveSize = existingItem.itemData.size
		}

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
		if (isPlant(newItemData)) {
			effectiveSize = getPlantSize(newItemData)
		} else if (newItemData.size !== undefined) {
			effectiveSize = newItemData.size
		}

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

// Global instance - TItem will be DraggableItem.
export const dragManager = new DragManager<DraggableItem>()
