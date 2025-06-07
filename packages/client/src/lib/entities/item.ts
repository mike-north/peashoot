import type { GridPlaceable } from '../../private/grid/grid-placement'
import type { GridItemPresentation } from '../../private/grid/grid-placement'

export type CompanionItemEdgeType = 'prefers-company' | 'prefers-not-company'

/**
 * Generic item interface that can represent any type of placeable item
 */
export interface Item extends GridPlaceable {
	readonly id: string
	readonly displayName: string
	readonly category: string
	readonly variant: string
	readonly size: number
	readonly presentation: GridItemPresentation
	// Additional properties can be stored in metadata
	readonly metadata?: Record<string, unknown>
}

export function isItem(item: unknown): item is Item {
	return (
		typeof item === 'object' &&
		item !== null &&
		'id' in item &&
		'displayName' in item &&
		'category' in item &&
		'variant' in item &&
		'size' in item &&
		'presentation' in item
	)
}

export function tileSizeForItem(item: Item): number {
	return Math.max(1, Math.ceil(item.size))
}

export function assertItemExists(item: Item | undefined): asserts item is Item {
	if (!item) {
		throw new Error('Item not found for isValidPlacement')
	}
}

export function categoryNameForItem(item: Item): string {
	return item.category
}
