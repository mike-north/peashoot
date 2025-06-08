import type { GridPlaceable } from '../../private/grid/grid-placement'

/**
 * Generic interface for adapting different item types to work with the workspace system
 */
export interface ItemAdapter<TItem extends GridPlaceable> {
	/**
	 * Check if an unknown value is a valid item of this type
	 */
	isValidItem(item: unknown): item is TItem

	/**
	 * Safely validate and cast an item to TItem
	 * @throws Error if the item is not a valid TItem
	 */
	validateAndCastItem(item: unknown): TItem
}
