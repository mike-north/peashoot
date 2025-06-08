import type {
	GridPlaceable,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	GridItemPresentation,
} from '../../private/grid/grid-placement'

/**
 * Generic item interface that can represent any type of placeable item
 */
export interface Item<M extends object = object> extends GridPlaceable {
	readonly category: string
	readonly variant: string
	// Additional properties can be stored in metadata
	readonly metadata: M
}

export function isItemWithMetadata<M extends object>(
	item: unknown,
	metadataGuard: (metadata: unknown) => metadata is M,
): item is Item<M> {
	return isItem(item) && 'metadata' in item && metadataGuard(item.metadata)
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
