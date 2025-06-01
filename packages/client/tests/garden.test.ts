/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi } from 'vitest'
import { movePlantBetweenBeds, type Garden } from '../src/lib/garden.js'
import type { GardenBed } from '../src/lib/garden-bed.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'
import type { Plant } from '../src/lib/entities/plant.js'

const mockPlant: Plant = {
	id: 'plant1',
	displayName: 'Tomato',
	family: 'Tomato',
	variant: 'red',
	plantingDistanceInFeet: 1,
	presentation: {
		accentColor: {
			r: 1,
			g: 0,
			b: 0,
		},
		iconPath: 'tomato.png',
	},
}

const plantPlacement: GridPlacement<Plant> = {
	id: 'placement1',
	item: mockPlant,
	sourceZoneId: 'bed1',
	x: 1,
	y: 2,
	size: 1,
}

const sourceBed: GardenBed = {
	id: 'bed1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [plantPlacement],
}

const targetBed: GardenBed = {
	id: 'bed2',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [],
}

const garden: Garden = {
	id: 'garden1',
	beds: [sourceBed, targetBed],
	edgeIndicators: [],
}

describe('movePlantBetweenBeds', () => {
	it('moves a plant from the source bed to the target bed with new coordinates', () => {
		const updated: Garden = movePlantBetweenBeds(
			garden,
			'bed1',
			'bed2',
			plantPlacement,
			3,
			4,
		)
		const { beds } = updated
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedSource] = beds.filter(
			(b: GardenBed) => b.id === 'bed1',
		) satisfies GardenBed[]
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedTarget] = beds.filter(
			(b: GardenBed) => b.id === 'bed2',
		) satisfies GardenBed[]

		expect(updatedSource.placements.length).toBe(0)
		expect(updatedTarget.placements.length).toBe(1)
		expect(updatedTarget.placements[0].x).toBe(3)
		expect(updatedTarget.placements[0].y).toBe(4)
		expect(updatedTarget.placements[0].id).toBe('placement1')
	})

	it('returns the original garden if source or target bed is missing', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {
			void 0
		})
		const updated: Garden = movePlantBetweenBeds(
			garden,
			'missing',
			'bed2',
			plantPlacement,
			3,
			4,
		)
		expect(updated).toBe(garden)
		expect(spy).toHaveBeenCalled()
		spy.mockRestore()
	})

	it('does not mutate the original garden object', () => {
		const updated: Garden = movePlantBetweenBeds(
			garden,
			'bed1',
			'bed2',
			plantPlacement,
			3,
			4,
		)
		expect(updated).not.toBe(garden)
		expect(garden.beds[0].placements.length).toBe(1)
		expect(garden.beds[1].placements.length).toBe(0)
	})
})
