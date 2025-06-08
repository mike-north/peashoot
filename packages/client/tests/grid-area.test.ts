import { describe, it, expect } from 'vitest'
import type { GridArea } from '../src/private/grid/grid-area.js'
import type { GridPlaceable, GridPlacement } from '../src/private/grid/grid-placement.js'

describe('Grid Area', () => {
	interface TestItem extends GridPlaceable {
		name: string
	}

	const createTestItem = (id: string, size: number): TestItem => ({
		id,
		name: `Test Item ${id}`,
		displayName: `Test Item ${id}`,
		size,
		presentation: {
			iconPath: '/icons/test.svg',
			accentColor: { red: 255, green: 0, blue: 0 },
		},
	})

	const createTestPlacement = (
		id: string,
		item: TestItem,
		x: number,
		y: number,
		sourceZoneId: string,
	): GridPlacement<TestItem> => ({
		id,
		item,
		sourceZoneId,
		x,
		y,
		size: item.size,
	})

	describe('Grid Area Properties', () => {
		it('allows valid grid area creation', () => {
			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 10,
				height: 10,
				placements: [],
			}

			expect(area).toBeDefined()
			expect(area.id).toBe('area-1')
			expect(area.width).toBe(10)
			expect(area.height).toBe(10)
			expect(area.placements).toEqual([])
		})

		it('allows grid area with placements', () => {
			const item1 = createTestItem('item-1', 1)
			const item2 = createTestItem('item-2', 2)

			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 10,
				height: 10,
				placements: [
					createTestPlacement('placement-1', item1, 0, 0, 'area-1'),
					createTestPlacement('placement-2', item2, 2, 2, 'area-1'),
				],
			}

			expect(area.placements).toHaveLength(2)
			expect(area.placements[0].item).toBe(item1)
			expect(area.placements[1].item).toBe(item2)
		})
	})

	describe('Grid Area Constraints', () => {
		it('validates placement boundaries', () => {
			const item = createTestItem('item-1', 2)
			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 3,
				height: 3,
				placements: [],
			}

			// Valid placements
			const validPlacements = [
				createTestPlacement('placement-1', item, 0, 0, 'area-1'), // Top-left
				createTestPlacement('placement-2', item, 1, 1, 'area-1'), // Center
			]

			// Invalid placements (would be out of bounds)
			const invalidPlacements = [
				createTestPlacement('placement-3', item, 2, 2, 'area-1'), // Would overflow
				createTestPlacement('placement-4', item, -1, 0, 'area-1'), // Negative X
				createTestPlacement('placement-5', item, 0, -1, 'area-1'), // Negative Y
			]

			// TypeScript should allow valid placements
			area.placements = validPlacements
			expect(area.placements).toHaveLength(2)

			// TypeScript should allow invalid placements (runtime validation would be needed)
			area.placements = invalidPlacements
			expect(area.placements).toHaveLength(3)
		})

		it('handles different item sizes', () => {
			const smallItem = createTestItem('small', 1)
			const mediumItem = createTestItem('medium', 2)
			const largeItem = createTestItem('large', 3)

			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 5,
				height: 5,
				placements: [
					createTestPlacement('placement-1', smallItem, 0, 0, 'area-1'),
					createTestPlacement('placement-2', mediumItem, 1, 1, 'area-1'),
					createTestPlacement('placement-3', largeItem, 2, 2, 'area-1'),
				],
			}

			expect(area.placements).toHaveLength(3)
			expect(area.placements[0].size).toBe(1)
			expect(area.placements[1].size).toBe(2)
			expect(area.placements[2].size).toBe(3)
		})
	})

	describe('Grid Area Operations', () => {
		it('allows adding and removing placements', () => {
			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 10,
				height: 10,
				placements: [],
			}

			const item = createTestItem('item-1', 1)
			const placement = createTestPlacement('placement-1', item, 0, 0, 'area-1')

			// Add placement
			area.placements.push(placement)
			expect(area.placements).toHaveLength(1)
			expect(area.placements[0]).toBe(placement)

			// Remove placement
			area.placements = area.placements.filter((p) => p.id !== 'placement-1')
			expect(area.placements).toHaveLength(0)
		})

		it('allows updating placement properties', () => {
			const item = createTestItem('item-1', 1)
			const area: GridArea<TestItem> = {
				id: 'area-1',
				width: 10,
				height: 10,
				placements: [createTestPlacement('placement-1', item, 0, 0, 'area-1')],
			}

			// Update placement position
			const updatedPlacement = {
				...area.placements[0],
				x: 1,
				y: 1,
			}
			area.placements[0] = updatedPlacement

			expect(area.placements[0].x).toBe(1)
			expect(area.placements[0].y).toBe(1)
		})
	})
})
