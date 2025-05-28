// Generic type for the item being dragged. This is the core data.
export type DraggableItem = Record<string, any> & { id: string; size?: number } // Must have an ID, size is optional

// Generic type for an item that exists in a zone (e.g., a placed item).
// It must contain the core DraggableItem data.
export type ExistingDraggableItem<TItem extends DraggableItem> = Record<string, any> & {
	id: string // ID of the placed instance
	itemData: TItem // The actual draggable item data
	x?: number // Optional coordinates if relevant to the zone
	y?: number
	size?: number // Often same as itemData.size but could differ
}

// Generic type for data associated with a drop zone
export type DropZoneContext = Record<string, any> & { id: string } // Must have an ID

// Types of drag sources
export type DragSourceType = 'existing-item' | 'new-item'

// Types of drop targets
export type DropTargetType = 'drop-zone' | 'delete-zone' // Renamed for clarity

// Async validation states
export type ValidationState = 'pending' | 'success' | 'error'

// Operation types for validation
export type OperationType =
	| 'item-move-within-zone'
	| 'item-move-across-zones'
	| 'item-add-to-zone'
	| 'item-remove-from-zone'
	| 'item-clone-in-zone'

// Validation context for async operations
export interface ValidationContext<
	TItem extends DraggableItem,
	TZoneCtx extends DropZoneContext,
> {
	operationType: OperationType
	item: TItem // The core item data (e.g., Plant)
	itemInstanceId?: string // ID of the item *instance* if it's an existing one (e.g., PlantPlacement.id)
	sourceZoneId?: string
	sourceZoneContext?: TZoneCtx // Context data of the source zone (e.g., GardenBed)
	targetZoneId?: string
	targetZoneContext?: TZoneCtx // Context data of the target zone
	sourceX?: number | undefined
	sourceY?: number | undefined
	targetX?: number | undefined
	targetY?: number | undefined
	// Application-specific context can be added by extending this interface
	// Example: applicationContext?: { garden?: Garden }
}

// Pending operation for async validation
export interface PendingOperation<TItem extends DraggableItem> {
	id: string // ID of the pending operation itself
	type: 'placement' | 'removal' // More abstract: 'add', 'update', 'remove'
	zoneId?: string // Target zone for placements
	x?: number // Target x for placements
	y?: number // Target y for placements
	size?: number // Size of the item in the operation
	item: TItem // The core item data
	state: ValidationState
	timestamp: number
}

// Enhanced drag state
export interface IDragState<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
> {
	draggedExistingItem: TExisting | null
	draggedNewItem: TItem | null // This is the core item data for a new item
	draggedItemEffectiveSize: number // Actual size being used for drag visuals/collision
	dragSourceType: DragSourceType
	dragOffset: { x: number; y: number }
	dragPosition: { x: number; y: number }
	isCloneMode: boolean
	highlightedCell: { x: number; y: number } | null // Grid-specific, consider abstracting if needed
	sourceZoneId: string | null
	targetZoneId: string | null
	targetType: DropTargetType | null
}
