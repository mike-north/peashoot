import { describe, it, expect } from 'vitest'
import { updateItemPositionInZone, type Zone } from '../../src/lib/entities/zone.js'
import type { PlantMetadata } from '../../src/lib/entities/plant-metadata.js'
import type { GridPlacement } from '../../src/private/grid/grid-placement.js'
import type { ExistingDraggableItem } from '../../src/private/dnd/types.js'
import type { GridArea } from '../../src/private/grid/grid-area.js'
import { type Item } from '../../src/lib/entities/item.js'

const mockItem: Item<PlantMetadata> = {
	id: 'plant_1',
	displayName: 'Tomato',
	category: 'tomatoes',
	variant: 'red',
	size: 1,
	metadata: {
		plantingDistanceInFeet: 1,
		family: 'tomatoes',
	},
	presentation: {
		accentColor: {
			red: 255,
			green: 0,
			blue: 0,
		},
		iconPath: 'tomato.png',
		size: 1,
	},
}

const mockPlacement: GridPlacement<Item> & ExistingDraggableItem<Item> = {
	item: mockItem,
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
	sourceZoneId: 'zone_1',
}

const mockZone: Zone & GridArea<Item> = {
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
			GridArea<Item>
		const [item1] = updated.placements as GridPlacement<Item>[]
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
			GridArea<Item>
		const [item1] = updated.placements as (GridPlacement<Item> &
			ExistingDraggableItem<Item>)[]
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
