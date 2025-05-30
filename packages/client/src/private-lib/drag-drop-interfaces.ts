import type { PlantWithSize } from './garden-bed'
import type { GridPlacement } from './grid-placement'
import type { Plant } from './plant'

// Interface for areas that contain draggable items
export interface DraggableArea {
	id: string
	type: 'garden-bed' | 'toolbar'

	// Called when a drag starts from this area
	onDragStart?: (item: GridPlacement<PlantWithSize>, event: MouseEvent) => void
}

// Interface for areas that can accept drops
export interface DropZone {
	id: string
	type: 'garden-bed' | 'delete-zone'

	// Check if a drop is valid at the given coordinates
	isValidDrop?: (
		draggedItem: GridPlacement<PlantWithSize>,
		x?: number,
		y?: number,
	) => boolean

	// Called when an item is dropped in this zone
	onDrop?: (draggedItem: GridPlacement<PlantWithSize>, x?: number, y?: number) => void

	// Called when mouse enters this drop zone during drag
	onDragEnter?: (draggedItem: GridPlacement<PlantWithSize> | Plant) => void

	// Called when mouse leaves this drop zone during drag
	onDragLeave?: () => void
}

// Coordinates for grid-based positioning
export interface GridCoordinates {
	x: number
	y: number
}

// Information about a drag operation
export interface DragInfo {
	sourceArea: DraggableArea
	draggedItem: GridPlacement<PlantWithSize> | Plant
	currentPosition: { x: number; y: number }
	gridCoordinates?: GridCoordinates
}
