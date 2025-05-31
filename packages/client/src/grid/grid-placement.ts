import type { RGB } from "../lib/color"

/**
 * Represents the placement of an item on a grid with integer coordinates.
 * This is a generic type that can be used for any item that needs to be
 * positioned on a grid (plants, buildings, etc.)
 */
export interface GridPlacement<T> {
	/** Unique identifier for this placement instance */
	readonly id: string
	/** The x coordinate on the grid (0-based) */
	readonly x: number
	/** The y coordinate on the grid (0-based) */
	readonly y: number
	/** The size of the item on the grid (e.g., 2 means 2x2) */
	readonly size: number
	/** The actual data for the item being placed */
	readonly data: T
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
export interface GridPlaceable {
	/** Unique identifier for the item type */
	readonly id: string
	/** Display name for the item */
	readonly displayName: string
	/** Size on the grid (e.g., 2 means 2x2) */
	readonly size: number
	/** Visual presentation data */
	readonly presentation: GridItemPresentation
}

export interface WithVisualPresentation extends GridPlaceable {
	presentation: GridItemPresentation
}
