import type { GridPlaceable } from '../../private/grid/grid-placement'

/**
 * Generic interface for adapting different item types to work with the workspace system
 */
export interface ItemAdapter<TItem extends GridPlaceable> {
	/**
	 * Get the display size for an item in grid units
	 */
	getItemSize(item: TItem): number

	/**
	 * Get the category name for an item (for drag/drop organization)
	 */
	getCategoryName(item: TItem): string

	/**
	 * Check if an unknown value is a valid item of this type
	 */
	isValidItem(item: unknown): item is TItem
}
