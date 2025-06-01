import type { RGB } from '../../lib/color'
import {
	type ExistingDraggableItem,
	type DraggableItem,
	isExistingDraggableItem,
} from '../dnd/types'

/**
 * Represents the placement of an item on a grid with integer coordinates.
 * This extends ExistingDraggableItem to be compatible with the drag system.
 */
export interface GridPlacement<T extends DraggableItem> extends ExistingDraggableItem<T> {
	/** The x coordinate on the grid (0-based) */
	readonly x: number
	/** The y coordinate on the grid (0-based) */
	readonly y: number
	/** The size of the item on the grid (e.g., 2 means 2x2) */
	readonly size: number
}

export function isGridPlacement(
	maybePlacement: unknown,
): maybePlacement is GridPlacement<DraggableItem>
export function isGridPlacement<T extends DraggableItem>(
	maybePlacement: unknown,
	itemGuard: (item: unknown) => item is T,
): maybePlacement is GridPlacement<T>
export function isGridPlacement<T extends DraggableItem>(
	maybePlacement: unknown,
	itemGuard?: (item: unknown) => item is T,
): maybePlacement is GridPlacement<T> {
	const baseCheck =
		isExistingDraggableItem(maybePlacement) &&
		'x' in maybePlacement &&
		typeof maybePlacement.x === 'number' &&
		'y' in maybePlacement &&
		typeof maybePlacement.y === 'number' &&
		'size' in maybePlacement &&
		typeof maybePlacement.size === 'number'
	if (itemGuard) {
		return baseCheck && itemGuard(maybePlacement.item)
	}
	return baseCheck
}

/**
 * Type guard to check if a grid item is placed in a zone
 * Note: All GridPlacements now have sourceZoneId since they extend ExistingDraggableItem
 */
export function isPlacedGridItem<T extends GridPlaceable>(
	item: GridPlacement<T>,
): item is GridPlacement<T> {
	return item.sourceZoneId !== ''
}

/**
 * Type guard to check if a grid item is new/unplaced
 * Note: This is now less relevant since GridPlacement extends ExistingDraggableItem
 */
export function isNewGridItem<T extends GridPlaceable>(
	item: GridPlacement<T>,
): item is GridPlacement<T> {
	return item.sourceZoneId === ''
}

/**
 * Visual presentation data for items that can be rendered on a grid
 */
export interface GridItemPresentation {
	/** Path to the icon to display */
	readonly iconPath: string
	/** Accent color for the tile background */
	readonly accentColor: RGB
	readonly size: number
}

/**
 * Interface for items that can be placed on a grid
 */
export interface GridPlaceable extends DraggableItem {
	/** Display name for the item */
	readonly displayName: string
	/** Visual presentation data */
	readonly presentation: GridItemPresentation
}

export function isGridPlaceable(item: unknown): item is GridPlaceable {
	return (
		item !== null &&
		typeof item === 'object' &&
		'id' in item && // from DraggableItem
		'displayName' in item &&
		'presentation' in item &&
		typeof (item as GridPlaceable).presentation === 'object' &&
		typeof (item as GridPlaceable).presentation.size === 'number'
	)
}

export interface WithVisualPresentation extends GridPlaceable {
	presentation: GridItemPresentation
}
