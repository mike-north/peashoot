import type { Attachment } from 'svelte/attachments'
import { get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { IDragState, DraggableItem, ExistingDraggableItem } from '../../dnd/types'
import {
	GardenBedLayoutCalculator,
	screenToGridCoordinates,
} from '../../private-lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../grid-layout-constants'
import type { GardenBed } from '../../lib/garden-bed'

interface GardenDragCoordinatorOptions {
	dragState: Writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	beds: GardenBed[]
	tileSizeForItem: (item: DraggableItem) => number
	onDrop: (dropInfo: {
		targetZoneId: string | null
		targetType: 'drop-zone' | 'delete-zone' | null
		highlightedCell: { x: number; y: number } | null
		isCloneMode: boolean
	}) => void
}

export function gardenDragCoordinator(options: GardenDragCoordinatorOptions): Attachment {
	const { tileSizeForItem } = options
	return (element) => {
		const htmlElement = element as HTMLElement
		const currentOptions = options

		function handleMouseMove(event: MouseEvent) {
			const currentCloneMode = event.metaKey || event.altKey
			const currentDragStateVal = get(currentOptions.dragState)

			// Only proceed if a drag is active
			if (
				!(currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem)
			) {
				return
			}

			let newTargetZoneId: string | null = null
			let newTargetType: 'drop-zone' | 'delete-zone' | null = null
			let newHighlightedCell: { x: number; y: number } | null = null

			// Check if over DeleteZone first
			if (currentDragStateVal.targetType === 'delete-zone') {
				newTargetZoneId = null
				newTargetType = 'delete-zone'
				newHighlightedCell = null
			} else {
				// Iterate over beds to find the target
				for (const bed of currentOptions.beds) {
					const bedComponentElement = htmlElement.querySelector(
						`[data-bed-id='${bed.id}']`,
					)
					const svgElement = bedComponentElement?.querySelector('svg')

					if (bedComponentElement && svgElement) {
						const rect = svgElement.getBoundingClientRect()

						if (
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom
						) {
							const layout = new GardenBedLayoutCalculator({
								width: bed.width,
								height: bed.height,
								tileSizeForItem,
								...DEFAULT_LAYOUT_PARAMS,
							})
							const gridCoords = screenToGridCoordinates(
								svgElement,
								layout,
								event.clientX,
								event.clientY,
							)
							newTargetZoneId = bed.id
							newTargetType = 'drop-zone'
							newHighlightedCell = gridCoords
							break
						}
					}
				}
			}

			currentOptions.dragState.update((s) => ({
				...s,
				dragPosition: { x: event.clientX, y: event.clientY },
				isCloneMode: s.dragSourceType === 'existing-item' ? currentCloneMode : false,
				targetZoneId: newTargetZoneId,
				targetType: newTargetType,
				highlightedCell: newHighlightedCell,
			}))
		}

		function handleMouseUp(_event: MouseEvent) {
			const currentDragStateVal = get(currentOptions.dragState)

			if (currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem) {
				currentOptions.onDrop({
					targetZoneId: currentDragStateVal.targetZoneId,
					targetType: currentDragStateVal.targetType,
					highlightedCell: currentDragStateVal.highlightedCell,
					isCloneMode: currentDragStateVal.isCloneMode,
				})
			}
		}

		// Only attach listeners when dragging
		const unsubscribe = currentOptions.dragState.subscribe((state) => {
			const isDragging =
				state.draggedExistingItem !== null || state.draggedNewItem !== null

			if (isDragging && !htmlElement.dataset.dragListenersAttached) {
				window.addEventListener('mousemove', handleMouseMove)
				window.addEventListener('mouseup', handleMouseUp)
				htmlElement.dataset.dragListenersAttached = 'true'
			} else if (!isDragging && htmlElement.dataset.dragListenersAttached) {
				window.removeEventListener('mousemove', handleMouseMove)
				window.removeEventListener('mouseup', handleMouseUp)
				delete htmlElement.dataset.dragListenersAttached
			}
		})

		return () => {
			unsubscribe()
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}
}
