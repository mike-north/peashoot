import { dragState } from '../ui/state/dragState'
import type { PlantPlacement } from './plant-placement'
import type { Plant } from './plant'
import type { DraggableArea, DropZone } from './drag-drop-interfaces'

export class DragManager {
	private registeredDraggableAreas = new Map<string, DraggableArea>()
	private registeredDropZones = new Map<string, DropZone>()

	// Register a draggable area
	registerDraggableArea(area: DraggableArea) {
		this.registeredDraggableAreas.set(area.id, area)
	}

	// Register a drop zone
	registerDropZone(zone: DropZone) {
		this.registeredDropZones.set(zone.id, zone)
	}

	// Unregister areas/zones (for cleanup)
	unregisterDraggableArea(id: string) {
		this.registeredDraggableAreas.delete(id)
	}

	unregisterDropZone(id: string) {
		this.registeredDropZones.delete(id)
	}

	// Start dragging an existing plant from a garden bed
	startDraggingExistingPlant(
		plant: PlantPlacement,
		sourceBedId: string,
		event: MouseEvent,
	) {
		const isCloneMode = event.metaKey || event.altKey // cmd on Mac, alt on Windows/Linux
		
		dragState.set({
			draggedPlant: plant,
			draggedNewPlant: null,
			draggedTileSize: plant.plantTile.size || 1,
			dragSourceType: 'existing-plant',
			dragOffset: { x: event.clientX, y: event.clientY },
			dragPosition: { x: event.clientX, y: event.clientY },
			highlightedCell: null,
			sourceBedId,
			targetBedId: null,
			targetType: null,
			isCloneMode,
		})
	}

	// Start dragging a new plant from the toolbar
	startDraggingNewPlant(plant: Plant, event: MouseEvent) {
		dragState.set({
			draggedPlant: null,
			draggedNewPlant: plant,
			draggedTileSize: plant.size || 1,
			dragSourceType: 'new-plant',
			dragOffset: { x: event.clientX, y: event.clientY },
			dragPosition: { x: event.clientX, y: event.clientY },
			highlightedCell: null,
			sourceBedId: null,
			targetBedId: null,
			targetType: null,
			isCloneMode: false, // Clone mode doesn't apply to new plants
		})
	}

	// Clean up drag state
	cleanup() {
		dragState.set({
			draggedPlant: null,
			draggedNewPlant: null,
			draggedTileSize: 1,
			dragSourceType: 'existing-plant',
			dragOffset: { x: 0, y: 0 },
			dragPosition: { x: 0, y: 0 },
			highlightedCell: null,
			sourceBedId: null,
			targetBedId: null,
			targetType: null,
			isCloneMode: false,
		})
	}

	// Get the current drag state
	getCurrentDragState() {
		return dragState
	}
}

// Global instance
export const dragManager = new DragManager()
