import type { Action } from 'svelte/action'
import { type Writable, get } from 'svelte/store'
import type { IDragState } from '../dnd/types'
import { isDraggingExistingItem as checkIsDraggingExistingItem } from '../../ui/state/dragState' // Renamed import

interface DeleteZoneOptions {
	dragStateStore: Writable<IDragState<any, any>>
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

	return {
		destroy() {
			node.removeEventListener('mouseenter', handleMouseEnter)
			node.removeEventListener('mouseleave', handleMouseLeave)
		},
		update(newOptions: DeleteZoneOptions) {
			currentOptions = newOptions
		},
	}
}
