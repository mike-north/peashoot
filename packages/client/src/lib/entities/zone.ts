import type { GridArea } from '../../private/grid/grid-area'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { Item } from './item'

// Use Item directly as the placeable type
export type ItemWithSize = Item

export interface Zone<T extends ItemWithSize = ItemWithSize> extends GridArea<T> {
	readonly id: string
	width: number
	height: number
	waterLevel: number
	sunLevel: number
}

export function updateItemPositionInZone(
	zone: Zone,
	itemId: string,
	newX: number,
	newY: number,
): Zone {
	return {
		...zone,
		placements: zone.placements.map((p: GridPlacement<ItemWithSize>) =>
			p.id === itemId ? { ...p, x: newX, y: newY } : p,
		),
	}
}
