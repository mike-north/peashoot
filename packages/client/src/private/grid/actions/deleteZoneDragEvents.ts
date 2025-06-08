import type { Action } from 'svelte/action'
import { type Writable, get } from 'svelte/store'
import type { ItemInZone, IDragState } from '../../../private/dnd/types'
import type { WithId } from '../../../lib/entities/with-id'
import { isDraggingExistingItem as checkIsDraggingExistingItem } from '../../../private/dnd/state' // Renamed import

interface DeleteZoneOptions {
	dragStateStore: Writable<IDragState<WithId, ItemInZone<WithId>>>
	setIsHovered: (hovered: boolean) => void
}

export const deleteZoneDragEvents: Action<HTMLElement, DeleteZoneOptions> = (
	node,
	options,
) => {
	let currentOptions = options // Store options locally to handle updates

	function handleMouseEnter() {
		currentOptions.setIsHovered(true)
		const currentDragState = get(currentOptions.dragStateStore) // Use get from svelte/store
		if (checkIsDraggingExistingItem(currentDragState)) {
			currentOptions.dragStateStore.update((state) => ({
				...state,
				targetType: 'delete-zone',
				targetBedId: null,
				highlightedCell: null,
			}))
		}
	}

	function handleDrop(event: DragEvent) {
		const currentDragState = get(currentOptions.dragStateStore)
		if (checkIsDraggingExistingItem(currentDragState)) {
			currentOptions.dragStateStore.update((state) => ({
				...state,
				targetType: 'delete-zone', // Explicitly set targetType on drop
				droppedOutside: false, // Indicate drop was on a valid target
			}))
			// Prevent default to allow drop
			event.preventDefault()
		}
	}

	function handleMouseLeave() {
		currentOptions.setIsHovered(false)
		const currentDragState = get(currentOptions.dragStateStore) // Use get from svelte/store
		if (checkIsDraggingExistingItem(currentDragState)) {
			currentOptions.dragStateStore.update((state) => ({
				...state,
				targetType: null,
			}))
		}
	}

	node.addEventListener('mouseenter', handleMouseEnter)
	node.addEventListener('mouseleave', handleMouseLeave)
	node.addEventListener('dragover', (event) => {
		event.preventDefault()
	}) // Allow drop
	node.addEventListener('drop', handleDrop)

	return {
		destroy() {
			node.removeEventListener('mouseenter', handleMouseEnter)
			node.removeEventListener('mouseleave', handleMouseLeave)
			node.removeEventListener('dragover', (event) => {
				event.preventDefault()
			})
			node.removeEventListener('drop', handleDrop)
		},
		update(newOptions: DeleteZoneOptions) {
			currentOptions = newOptions
		},
	}
}
