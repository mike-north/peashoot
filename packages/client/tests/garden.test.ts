/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi } from 'vitest'
import {
	movePlantBetweenBedsAndCreateNewGarden,
	type Garden,
} from '../src/lib/entities/garden.js'
import type { GardenBed } from '../src/lib/entities/garden-bed.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'
import type { PlantItem } from '../src/lib/item-types/plant-item.js'
import { createPlantItem } from '../src/lib/item-types/plant-item.js'
import { GridArea } from '../src/private/grid/grid-area.js'
import { ExistingDraggableItem } from '../src/private/dnd/types.js'

const mockPlant: PlantItem = createPlantItem({
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

const plantPlacement: GridPlacement<PlantItem> & ExistingDraggableItem<PlantItem> = {
	id: 'placement1',
	item: mockPlant,
	sourceZoneId: 'bed1',
	x: 1,
	y: 2,
	size: 1,
}

const sourceBed: GardenBed & GridArea<PlantItem> = {
	id: 'bed_1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [plantPlacement],
}

const targetBed: GardenBed & GridArea<PlantItem> = {
	id: 'bed_2',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [],
}

const garden: Garden = {
	id: 'grdn_1',
	beds: [sourceBed, targetBed],
	edgeIndicators: [],
}

describe('movePlantBetweenBeds', () => {
	it('moves a plant from the source bed to the target bed with new coordinates', () => {
		const updated: Garden = movePlantBetweenBedsAndCreateNewGarden(
			garden,
			'bed_1',
			'bed_2',
			plantPlacement,
			3,
			4,
		)
		const { beds } = updated
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedSource] = beds.filter(
			(b: GardenBed) => b.id === 'bed_1',
		) satisfies GardenBed[]
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedTarget] = beds.filter(
			(b: GardenBed) => b.id === 'bed_2',
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
		const updated: Garden = movePlantBetweenBedsAndCreateNewGarden(
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
		const updated: Garden = movePlantBetweenBedsAndCreateNewGarden(
			garden,
			'bed_1',
			'bed_2',
			plantPlacement,
			3,
			4,
		)
		expect(updated).not.toBe(garden)
		expect(garden.beds[0].placements.length).toBe(1)
		expect(garden.beds[1].placements.length).toBe(0)
	})
})
