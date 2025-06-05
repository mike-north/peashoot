import type { Attachment } from 'svelte/attachments'
import { get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type {
	IDragState,
	DraggableItem,
	ExistingDraggableItem,
} from '../../../private/dnd/types'
import { ZoneLayoutCalculator, screenToGridCoordinates } from '../zone-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../grid-layout-constants'
import type { Zone } from '../../../lib/entities/zone'

interface WorkspaceDragCoordinatorOptions {
	dragState: Writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	zones: Zone[]
	tileSizeForItem: (item: DraggableItem) => number
	onDrop: (dropInfo: {
		targetZoneId: string | null
		targetType: 'drop-zone' | 'delete-zone' | null
		highlightedCell: { x: number; y: number } | null
		isCloneMode: boolean
	}) => void
}

export function workspaceDragCoordinator(
	options: WorkspaceDragCoordinatorOptions,
): Attachment {
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
				// Iterate over zones to find the target
				for (const zone of currentOptions.zones) {
					const zoneComponentElement = htmlElement.querySelector(
						`[data-zone-id='${zone.id}']`,
					)
					const svgElement = zoneComponentElement?.querySelector('svg')

					if (zoneComponentElement && svgElement) {
						const rect = svgElement.getBoundingClientRect()

						if (
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom
						) {
							const layout = new ZoneLayoutCalculator({
								width: zone.width,
								height: zone.height,
								tileSizeForItem,
								...DEFAULT_LAYOUT_PARAMS,
							})
							const gridCoords = screenToGridCoordinates(
								svgElement,
								layout,
								event.clientX,
								event.clientY,
							)
							newTargetZoneId = zone.id
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

		function handleMouseUp(event: MouseEvent) {
			const currentDragStateVal = get(currentOptions.dragState)

			let finalTargetZoneId: string | null = null
			let finalTargetType: 'drop-zone' | 'delete-zone' | null = null
			let finalHighlightedCell: { x: number; y: number } | null = null

			// Check elements at the exact mouseup position
			const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY)
			const deleteZoneElement = elementsAtPoint.find((el) =>
				el.closest('[data-delete-zone="true"]'),
			)

			if (deleteZoneElement) {
				finalTargetType = 'delete-zone'
			} else {
				for (const zone of currentOptions.zones) {
					const zoneComponentElement = htmlElement.querySelector(
						`[data-zone-id='${zone.id}']`,
					)
					const svgElement = zoneComponentElement?.querySelector('svg')

					if (zoneComponentElement && svgElement) {
						const rect = svgElement.getBoundingClientRect()
						if (
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom
						) {
							const layout = new ZoneLayoutCalculator({
								width: zone.width,
								height: zone.height,
								tileSizeForItem,
								...DEFAULT_LAYOUT_PARAMS,
							})
							const gridCoords = screenToGridCoordinates(
								svgElement,
								layout,
								event.clientX,
								event.clientY,
							)
							finalTargetZoneId = zone.id
							finalTargetType = 'drop-zone'
							finalHighlightedCell = gridCoords
							break
						}
					}
				}
			}

			if (currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem) {
				currentOptions.onDrop({
					targetZoneId: finalTargetZoneId,
					targetType: finalTargetType,
					highlightedCell: finalHighlightedCell,
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
