import type { WithId } from '../../lib/entities/with-id'

export function isDraggableItem(item: unknown): item is WithId {
	if (typeof item !== 'object' || item === null) return false
	const obj = item as Record<string, unknown>
	return 'id' in obj && typeof obj.id === 'string'
}

/**
 * Represents an existing instance of a draggable item that is already placed
 * somewhere and can be dragged to a new location.
 *
 * This interface focuses solely on drag-and-drop concerns - the actual
 * placement data (coordinates, etc.) should be managed elsewhere.
 */
export interface ItemInZone<TItem extends WithId> {
	/** Unique identifier for this specific placed instance */
	id: string
	/** The underlying draggable item data */
	item: TItem
	/** The zone/container this item currently belongs to */
	sourceZoneId: string
}

export function isPlacedDraggableItem(zoneItem: unknown): zoneItem is ItemInZone<WithId>
export function isPlacedDraggableItem<TItem extends WithId>(
	zoneItem: unknown,
	itemGuard: (item: unknown) => item is TItem,
): zoneItem is ItemInZone<TItem>
export function isPlacedDraggableItem<TItem extends WithId>(
	zoneItem: unknown,
	itemGuard?: (item: unknown) => item is TItem,
): zoneItem is ItemInZone<TItem> {
	const baseCheck =
		typeof zoneItem === 'object' &&
		zoneItem !== null &&
		'id' in zoneItem &&
		'sourceZoneId' in zoneItem &&
		'item' in zoneItem
	if (itemGuard) {
		return baseCheck && itemGuard(zoneItem.item)
	}
	return baseCheck
}

// Generic type for data associated with a drop zone
export interface DropZoneContext {
	id: string
} // Must have an ID

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
	TItem extends WithId,
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
export interface PendingOperation<TItem extends WithId> {
	id: string
	type: 'placement' | 'removal' | 'clone' // Added 'clone'
	item: TItem
	zoneId?: string // For placement, target zone; for removal, source zone
	x?: number
	y?: number
	size: number // Effective size for display
	state: ValidationState
	timestamp: number
	originalInstanceId?: string // For move/clone: ID of the original item instance
	originalSourceZoneId?: string // For move/clone: Zone ID of the original item instance
}

// Enhanced drag state
export interface IDragState<TItem extends WithId, TExisting extends ItemInZone<TItem>> {
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
