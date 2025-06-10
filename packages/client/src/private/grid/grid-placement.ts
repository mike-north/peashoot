import type { IRGBColor } from '@peashoot/types'
import { type ItemInZone } from '../dnd/types'
import { isWithId, type WithId } from '../../lib/entities/with-id'

/**
 * Represents the placement of an item on a grid with integer coordinates.
 * This extends ExistingDraggableItem to be compatible with the drag system.
 */
export interface GridPlacement<T extends WithId> extends ItemInZone<T> {
	/** The x coordinate on the grid (0-based) */
	readonly x: number
	/** The y coordinate on the grid (0-based) */
	readonly y: number
	/** The size of the item on the grid (e.g., 2 means 2x2) */
	readonly size: number
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
	readonly accentColor: IRGBColor
}

/**
 * Interface for items that can be placed on a grid
 */
export interface GridPlaceable extends WithId {
	/** Display name for the item */
	readonly displayName: string
	/** Visual presentation data */
	readonly presentation: GridItemPresentation
	/** Size of the item on the grid (e.g., 2 means 2x2) */
	readonly size: number
}

export function isGridPlaceable(item: unknown): item is GridPlaceable {
	return (
		isWithId(item) &&
		'displayName' in item &&
		'presentation' in item &&
		!('key' in item && 'centerX' in item && 'effects' in item) && // Not an IndicatorVisual
		'size' in item &&
		typeof item.size === 'number' &&
		item.presentation !== null &&
		typeof item.presentation === 'object' &&
		'iconPath' in item.presentation &&
		typeof item.presentation.iconPath === 'string'
	)
}

export interface WithVisualPresentation extends GridPlaceable {
	presentation: GridItemPresentation
}
