import { describe, it, expect } from 'vitest'
import {
	updateItemPositionInZone,
	type Zone,
	type ItemWithSize,
} from '../src/lib/entities/zone.js'
import type { PlantItem } from '../src/lib/item-types/plant-item.js'
import { createPlantItem } from '../src/lib/item-types/plant-item.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'
import { ExistingDraggableItem } from '../src/private/dnd/types.js'
import type { GridArea } from '../src/private/grid/grid-area.js'

const mockItem: PlantItem = createPlantItem({
	id: 'plant_1',
	displayName: 'Tomato',
	family: 'tomatoes',
	variant: 'red',
	plantingDistanceInFeet: 1,
	presentation: {
		accentColor: {
			red: 255,
			green: 0,
			blue: 0,
		},
		iconPath: 'tomato.png',
		size: 1,
	},
})

const mockPlacement: GridPlacement<ItemWithSize> & ExistingDraggableItem<ItemWithSize> = {
	item: mockItem,
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
	sourceZoneId: 'zone_1',
}

const mockZone: Zone & GridArea<ItemWithSize> = {
	id: 'zone_1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [mockPlacement],
}

describe('updateItemPositionInZone', () => {
	it('updates the position of the specified item', () => {
		const updated = updateItemPositionInZone(mockZone, 'placement1', 3, 4) as Zone &
			GridArea<ItemWithSize>
		const [item1] = updated.placements as GridPlacement<ItemWithSize>[]
		expect(item1.x).toBe(3)
		expect(item1.y).toBe(4)
		// Should not mutate the original
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockZone.placements[0].x).toBe(1)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockZone.placements[0].y).toBe(2)
	})

	it('does not update if itemId does not match', () => {
		const updated = updateItemPositionInZone(mockZone, 'nonexistent', 5, 6) as Zone &
			GridArea<ItemWithSize>
		const [item1] = updated.placements as (GridPlacement<ItemWithSize> &
			ExistingDraggableItem<ItemWithSize>)[]
		expect(item1.x).toBe(1)
		expect(item1.y).toBe(2)
		// Should not mutate the original
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockZone.placements[0].x).toBe(1)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockZone.placements[0].y).toBe(2)
	})

	it('returns a new Zone object', () => {
		const updated: Zone = updateItemPositionInZone(mockZone, 'placement1', 3, 4)
		expect(updated).not.toBe(mockZone)
	})
})
