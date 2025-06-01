import { describe, it, expect } from 'vitest'
import {
	PlantWithSize,
	updatePlantPositionInBed,
	type GardenBed,
} from '../src/lib/garden-bed.js'
import type { Plant } from '../src/lib/plant.js'
import type { GridPlacement } from '../src/grid/grid-placement.js'

const mockPlant: Plant = {
	id: 'plant1',
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

const mockPlacement: GridPlacement<PlantWithSize> = {
	data: mockPlant,
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
}

const mockBed: GardenBed = {
	id: 'bed1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [mockPlacement],
}

describe('updatePlantPositionInBed', () => {
	it('updates the position of the specified plant', () => {
		const updated = updatePlantPositionInBed(mockBed, 'placement1', 3, 4)
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
		const updated: GardenBed = updatePlantPositionInBed(mockBed, 'nonexistent', 5, 6)
		const [plant1] = updated.placements as GridPlacement<PlantWithSize>[]
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
