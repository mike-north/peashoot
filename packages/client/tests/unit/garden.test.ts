import { describe, it, expect, vi } from 'vitest'
import type { GridArea } from '../../src/private/grid/grid-area.js'
import type { WithId } from '../../src/lib/entities/with-id.js'
import {
	moveItemBetweenZonesAndCreateNewWorkspace,
	type ItemPlacement,
	type Plant,
	type Workspace,
	type Zone,
} from '@peashoot/types'

const mockPlant: Plant = {
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
	},
	metadata: {
		plantingDistance: {
			value: 1,
			unit: 'feet',
		},
	},
}

const plantPlacement: ItemPlacement = {
	id: 'placement1',
	item: mockPlant,
	sourceZoneId: 'zone1',
	position: {
		x: 1,
		y: 2,
	},
}

const sourceZone: Zone & WithId & GridArea = {
	id: 'zone_1',
	name: 'Zone 1',
	description: 'Zone 1',
	width: 4,
	height: 4,
	placements: [plantPlacement],
}

const targetZone: Zone & WithId & GridArea = {
	id: 'zone_2',
	name: 'Zone 2',
	description: 'Zone 2',
	width: 4,
	height: 4,
	placements: [],
}

const workspace: Workspace = {
	id: 'workspace_1',
	zones: [sourceZone, targetZone],
	indicators: [],
	metadata: {},
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
		const { zones } = updated as {
			zones: (Zone & WithId & GridArea)[]
		}
		const [updatedSource] = zones.filter((z) => z.id === 'zone_1') satisfies Zone[]
		const [updatedTarget] = zones.filter((z) => z.id === 'zone_2') satisfies Zone[]

		expect(updatedSource.placements.length).toBe(0)
		expect(updatedTarget.placements.length).toBe(1)
		expect(updatedTarget.placements[0].position.x).toBe(3)
		expect(updatedTarget.placements[0].position.y).toBe(4)
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
