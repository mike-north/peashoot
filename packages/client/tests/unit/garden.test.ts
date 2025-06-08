/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi } from 'vitest'
import {
	moveItemBetweenZonesAndCreateNewWorkspace,
	type Workspace,
} from '../../src/lib/entities/workspace.js'
import type { Zone } from '../../src/lib/entities/zone.js'
import type { GridPlacement } from '../../src/private/grid/grid-placement.js'
import type { GridArea } from '../../src/private/grid/grid-area.js'
import type { ExistingDraggableItem } from '../../src/private/dnd/types.js'
import { type PlantMetadata } from '../../src/lib/entities/plant-metadata.js'
import { type Item } from '../../src/lib/entities/item.js'

const mockPlant: Item<PlantMetadata> = {
	id: 'plant_1',
	displayName: 'Tomato',
	category: 'tomatoes',
	variant: 'red',
	size: 1,
	presentation: {
		accentColor: {
			red: 255,
			green: 0,
			blue: 0,
		},
		iconPath: 'tomato.png',
		size: 1,
	},
	metadata: {
		plantingDistanceInFeet: 1,
		family: 'tomatoes',
	},
}

const plantPlacement: GridPlacement<Item<PlantMetadata>> &
	ExistingDraggableItem<Item<PlantMetadata>> = {
	id: 'placement1',
	item: mockPlant,
	sourceZoneId: 'zone1',
	x: 1,
	y: 2,
	size: 1,
}

const sourceZone: Zone<Item<PlantMetadata>> & GridArea<Item<PlantMetadata>> = {
	id: 'zone_1',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [plantPlacement],
}

const targetZone: Zone<Item<PlantMetadata>> & GridArea<Item<PlantMetadata>> = {
	id: 'zone_2',
	width: 4,
	height: 4,
	waterLevel: 5,
	sunLevel: 7,
	placements: [],
}

const workspace: Workspace = {
	id: 'workspace_1',
	zones: [sourceZone, targetZone],
	indicators: [],
}

describe('moveItemBetweenZones', () => {
	it('moves an item from the source zone to the target zone with new coordinates', () => {
		const updated: Workspace = moveItemBetweenZonesAndCreateNewWorkspace(
			workspace,
			'zone_1',
			'zone_2',
			plantPlacement,
			3,
			4,
		)
		const { zones } = updated
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedSource] = zones.filter(
			(z: Zone<Item<PlantMetadata>>) => z.id === 'zone_1',
		) satisfies Zone<Item<PlantMetadata>>[]
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const [updatedTarget] = zones.filter(
			(z: Zone<Item<PlantMetadata>>) => z.id === 'zone_2',
		) satisfies Zone<Item<PlantMetadata>>[]

		expect(updatedSource.placements.length).toBe(0)
		expect(updatedTarget.placements.length).toBe(1)
		expect(updatedTarget.placements[0].x).toBe(3)
		expect(updatedTarget.placements[0].y).toBe(4)
		expect(updatedTarget.placements[0].id).toBe('placement1')
	})

	it('returns the original workspace if source or target zone is missing', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {
			void 0
		})
		const updated: Workspace = moveItemBetweenZonesAndCreateNewWorkspace(
			workspace,
			'missing',
			'zone2',
			plantPlacement,
			3,
			4,
		)
		expect(updated).toBe(workspace)
		expect(spy).toHaveBeenCalled()
		spy.mockRestore()
	})

	it('does not mutate the original workspace object', () => {
		const updated: Workspace = moveItemBetweenZonesAndCreateNewWorkspace(
			workspace,
			'zone_1',
			'zone_2',
			plantPlacement,
			3,
			4,
		)
		expect(updated).not.toBe(workspace)
		expect(workspace.zones[0].placements.length).toBe(1)
		expect(workspace.zones[1].placements.length).toBe(0)
	})
})
