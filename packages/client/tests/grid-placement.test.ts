import { describe, it, expect } from 'vitest'
import {
	type GridPlacement,
	isGridPlacement,
	isPlacedGridItem,
	isNewGridItem,
	type GridPlaceable,
	isGridPlaceable,
	type WithVisualPresentation,
} from '../src/private/grid/grid-placement.js'

describe('Grid Placement', () => {
	describe('GridPlacement', () => {
		interface TestItem extends GridPlaceable {
			name: string
		}

		const testItemGuard = (item: unknown): item is TestItem => {
			return (
				isGridPlaceable(item) &&
				'name' in item &&
				typeof (item as TestItem).name === 'string'
			)
		}

		it('validates grid placements correctly', () => {
			const validPlacement: GridPlacement<TestItem> = {
				id: 'placement-1',
				item: {
					id: 'test-1',
					name: 'Test Item',
					displayName: 'Test Item',
					size: 1,
					presentation: {
						iconPath: '/icons/test.svg',
						accentColor: { red: 255, green: 0, blue: 0 },
					},
				},
				sourceZoneId: 'zone-1',
				x: 0,
				y: 0,
				size: 1,
			}

			// Test without item guard
			expect(isGridPlacement(validPlacement)).toBe(true)
			expect(isGridPlacement(null)).toBe(false)
			expect(isGridPlacement({})).toBe(false)
			expect(isGridPlacement({ id: 'test' })).toBe(false)

			// Test with item guard
			expect(isGridPlacement(validPlacement, testItemGuard)).toBe(true)
			expect(
				isGridPlacement(
					{
						id: 'placement-1',
						item: {
							id: 'test-1',
							displayName: 'Test Item',
							presentation: {
								iconPath: '/icons/test.svg',
								accentColor: { red: 255, green: 0, blue: 0 },
								size: 1,
							},
						}, // Missing name
						sourceZoneId: 'zone-1',
						x: 0,
						y: 0,
						size: 1,
					},
					testItemGuard,
				),
			).toBe(false)

			// Test invalid coordinate types
			expect(
				isGridPlacement({
					id: 'placement-1',
					item: {
						id: 'test-1',
						name: 'Test Item',
						displayName: 'Test Item',
						presentation: {
							iconPath: '/icons/test.svg',
							accentColor: { red: 255, green: 0, blue: 0 },
							size: 1,
						},
					},
					sourceZoneId: 'zone-1',
					x: '0', // Wrong type
					y: 0,
					size: 1,
				}),
			).toBe(false)
		})
	})

	describe('Grid Item Placement Status', () => {
		interface TestItem extends GridPlaceable {
			name: string
		}

		it('identifies placed and unplaced items correctly', () => {
			const placedItem: GridPlacement<TestItem> = {
				id: 'placement-1',
				item: {
					id: 'test-1',
					name: 'Test Item',
					displayName: 'Test Item',
					size: 1,
					presentation: {
						iconPath: '/icons/test.svg',
						accentColor: { red: 255, green: 0, blue: 0 },
					},
				},
				sourceZoneId: 'zone-1',
				x: 0,
				y: 0,
				size: 1,
			}

			const unplacedItem: GridPlacement<TestItem> = {
				id: 'placement-1',
				item: {
					id: 'test-1',
					name: 'Test Item',
					displayName: 'Test Item',
					size: 1,
					presentation: {
						iconPath: '/icons/test.svg',
						accentColor: { red: 255, green: 0, blue: 0 },
					},
				},
				sourceZoneId: '',
				x: 0,
				y: 0,
				size: 1,
			}

			expect(isPlacedGridItem(placedItem)).toBe(true)
			expect(isPlacedGridItem(unplacedItem)).toBe(false)
			expect(isNewGridItem(placedItem)).toBe(false)
			expect(isNewGridItem(unplacedItem)).toBe(true)
		})
	})

	describe('GridPlaceable', () => {
		it('validates grid placeable items correctly', () => {
			const validItem: GridPlaceable = {
				id: 'test-1',
				displayName: 'Test Item',
				size: 1,
				presentation: {
					iconPath: '/icons/test.svg',
					accentColor: { red: 255, green: 0, blue: 0 },
				},
			}

			expect(isGridPlaceable(validItem)).toBe(true)

			// Test invalid cases
			expect(isGridPlaceable(null)).toBe(false)
			expect(isGridPlaceable(undefined)).toBe(false)
			expect(isGridPlaceable({})).toBe(false)
			expect(isGridPlaceable({ id: 'test' })).toBe(false)
			expect(
				isGridPlaceable({
					id: 'test-1',
					displayName: 'Test Item',
					presentation: null,
				}),
			).toBe(false)
			expect(
				isGridPlaceable({
					id: 'test-1',
					displayName: 'Test Item',
					presentation: {
						iconPath: '/icons/test.svg',
						accentColor: { red: 255, green: 0, blue: 0 },
						size: '1', // Wrong type
					},
				}),
			).toBe(false)
		})
	})

	describe('WithVisualPresentation', () => {
		it('allows extending GridPlaceable with visual presentation', () => {
			const item: WithVisualPresentation = {
				id: 'test-1',
				displayName: 'Test Item',
				size: 1,
				presentation: {
					iconPath: '/icons/test.svg',
					accentColor: { red: 255, green: 0, blue: 0 },
				},
			}

			// TypeScript should compile this without errors
			expect(item).toBeDefined()
			expect(item.presentation).toBeDefined()
			expect(item.presentation.iconPath).toBe('/icons/test.svg')
			expect(item.presentation.accentColor).toEqual({ red: 255, green: 0, blue: 0 })
			expect(item.size).toBe(1)
		})
	})
})
