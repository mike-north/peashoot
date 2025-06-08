import type { Action } from 'svelte/action'
import type { ItemInZone, IDragState } from '../../../private/dnd/types'
import type { WithId } from '../../../lib/entities/with-id'

/**
 * A Svelte action that disables pointer events on an element when an item is being dragged,
 * and re-enables them otherwise. It listens to the provided drag state.
 */
export const disablePointerEventsWhenDragging: Action<
	HTMLElement | SVGElement,
	Readonly<IDragState<WithId, ItemInZone<WithId>>>
> = (node, dragState) => {
	function setPointerEvents(isDragging: boolean) {
		node.style.pointerEvents = isDragging ? 'none' : 'auto'
	}

	// Initial check based on the initial drag state
	setPointerEvents(!!(dragState.draggedNewItem || dragState.draggedExistingItem))

	return {
		update(newDragState: Readonly<IDragState<WithId, ItemInZone<WithId>>>) {
			// Update pointer events when the drag state changes
			setPointerEvents(
				!!(newDragState.draggedNewItem || newDragState.draggedExistingItem),
			)
		},
		// No destroy needed as we are only manipulating styles and not adding event listeners on the node itself.
	}
}
