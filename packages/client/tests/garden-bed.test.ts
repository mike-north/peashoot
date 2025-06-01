import { describe, it, expect } from 'vitest'
import {
	PlantWithSize,
	updatePlantPositionInBed,
	type GardenBed,
} from '../src/lib/entities/garden-bed.js'
import type { Plant } from '../src/lib/entities/plant.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'
import { ExistingDraggableItem } from '../src/private/dnd/types.js'
import type { GridArea } from '../src/private/grid/grid-area.js'

const mockPlant: Plant = {
	id: 'plant_1',
	displayName: 'Tomato',
	presentation: {
		iconPath: 'tomato.png',
		accentColor: {
			r: 1,
			g: 0,
			b: 0,
		},
		size: 1,
	},
	family: 'Tomato',
	variant: 'red',
	plantingDistanceInFeet: 1,
}

const mockPlacement: GridPlacement<PlantWithSize> & ExistingDraggableItem<PlantWithSize> =
	{
		item: mockPlant,
		x: 1,
		y: 2,
		id: 'placement1',
		size: 1,
		sourceZoneId: 'gbed_1',
	}

const mockBed: GardenBed & GridArea<PlantWithSize> = {
	id: 'gbed_1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [mockPlacement],
}

describe('updatePlantPositionInBed', () => {
	it('updates the position of the specified plant', () => {
		const updated = updatePlantPositionInBed(mockBed, 'placement1', 3, 4) as GardenBed &
			GridArea<PlantWithSize>
		const [plant1] = updated.placements as GridPlacement<PlantWithSize>[]
		expect(plant1.x).toBe(3)
		expect(plant1.y).toBe(4)
		// Should not mutate the original
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockBed.placements[0].x).toBe(1)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockBed.placements[0].y).toBe(2)
	})

	it('does not update if plantId does not match', () => {
		const updated = updatePlantPositionInBed(mockBed, 'nonexistent', 5, 6) as GardenBed &
			GridArea<PlantWithSize>
		const [plant1] = updated.placements as (GridPlacement<PlantWithSize> &
			ExistingDraggableItem<PlantWithSize>)[]
		expect(plant1.x).toBe(1)
		expect(plant1.y).toBe(2)
		// Should not mutate the original
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockBed.placements[0].x).toBe(1)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(mockBed.placements[0].y).toBe(2)
	})

	it('returns a new GardenBed object', () => {
		const updated: GardenBed = updatePlantPositionInBed(mockBed, 'placement1', 3, 4)
		expect(updated).not.toBe(mockBed)
	})
})
