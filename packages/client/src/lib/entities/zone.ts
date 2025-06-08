import type { GridArea } from '../../private/grid/grid-area'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { Item } from './item'

export interface Zone<T extends Item = Item> extends GridArea<T> {
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
		placements: zone.placements.map((p: GridPlacement<Item>) =>
			p.id === itemId ? { ...p, x: newX, y: newY } : p,
		),
	}
}
