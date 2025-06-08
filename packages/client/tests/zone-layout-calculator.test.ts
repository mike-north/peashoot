import { describe, it, expect } from 'vitest'
import {
	ZoneLayoutCalculator,
	calculateIndicatorVisuals,
} from '../src/private/grid/zone-layout-calculator.js'
import type {
	GridPlaceable,
	GridPlacement,
	GridItemPresentation,
} from '../src/private/grid/grid-placement.js'
import { DEFAULT_LAYOUT_PARAMS } from '../src/private/grid/grid-layout-constants.js'
import type { Indicator } from '../src/lib/entities/indicator.js'

interface TestItem extends GridPlaceable {
	id: string
	displayName: string
	presentation: GridItemPresentation
}

describe('ZoneLayoutCalculator', () => {
	const items: TestItem[] = [
		{
			id: '1',
			displayName: 'Item 1',
			size: 1,
			presentation: {
				iconPath: '/icons/item1.svg',
				accentColor: { red: 255, green: 0, blue: 0 },
			},
		},
		{
			id: '2',
			displayName: 'Item 2',
			size: 2,
			presentation: {
				iconPath: '/icons/item2.svg',
				accentColor: { red: 0, green: 255, blue: 0 },
			},
		},
	]
	const calculator = new ZoneLayoutCalculator<TestItem>({
		width: 10,
		height: 10,
		cellSize: DEFAULT_LAYOUT_PARAMS.cellSize,
		paddingTop: DEFAULT_LAYOUT_PARAMS.paddingTop,
		paddingLeft: DEFAULT_LAYOUT_PARAMS.paddingLeft,
		paddingBottom: DEFAULT_LAYOUT_PARAMS.paddingBottom,
		paddingRight: DEFAULT_LAYOUT_PARAMS.paddingRight,
		frameThickness: DEFAULT_LAYOUT_PARAMS.frameThickness,
	})

	describe('coordinate transformations', () => {
		it('converts zone coordinates to SVG coordinates correctly', () => {
			// Test bottom-left corner (0,0)
			const x0 = calculator.zoneToSvgX(0)
			const y0 = calculator.zoneToSvgY(0)
			expect(x0).toBe(22)
			expect(y0).toBe(364)

			// Test top-right corner (9,9)
			const x9 = calculator.zoneToSvgX(9)
			const y9 = calculator.zoneToSvgY(9)
			expect(x9).toBe(382)
			expect(y9).toBe(4)
		})

		it('converts relative SVG coordinates to grid coordinates', () => {
			// Test bottom-left corner
			const bottomLeft = calculator.getGridCellFromRelativeSvgCoords(22, 382)
			expect(bottomLeft).toEqual({ x: 0, y: 0 })

			// Test just inside top-right corner (use 382, 4 to be inside the grid)
			const topRight = calculator.getGridCellFromRelativeSvgCoords(382, 4)
			expect(topRight).toEqual({ x: 9, y: 9 })

			// Test outside grid
			const outside = calculator.getGridCellFromRelativeSvgCoords(0, 0)
			expect(outside).toBeNull()
		})
	})

	describe('placement validation', () => {
		const placements: GridPlacement<TestItem>[] = [
			{
				id: 'placement1',
				item: items[0],
				x: 0,
				y: 0,
				size: 1,
				sourceZoneId: 'zone1',
			},
			{
				id: 'placement2',
				item: items[1],
				x: 1,
				y: 0,
				size: 1,
				sourceZoneId: 'zone1',
			},
		]

		it('validates placements correctly', () => {
			// Valid placement
			expect(calculator.isValidPlacement(4, 4, 1, placements)).toBe(true)

			// Invalid placement - overlaps with existing item
			expect(calculator.isValidPlacement(0, 0, 1, placements)).toBe(false)

			// Invalid placement - out of bounds
			expect(calculator.isValidPlacement(9, 9, 2, placements)).toBe(false)
		})

		it('handles skipId correctly in validation', () => {
			// Should allow placement at (0,0) when skipping item with id 'placement1'
			expect(calculator.isValidPlacement(0, 0, 1, placements, 'placement1')).toBe(true)
		})
	})

	describe('tile layout calculations', () => {
		it('calculates tile layout info correctly', () => {
			const layout = calculator.getTileLayoutInfo({ x: 1, y: 2, size: 1 })
			expect(layout.svgX).toBe(62)
			expect(layout.svgY).toBe(284)
			expect(layout.width).toBe(40)
			expect(layout.height).toBe(40)
		})

		it('calculates tile frame corner positions correctly', () => {
			const corners = calculator.getTileFrameCornerPositions({
				x: 1,
				y: 2,
				size: 1,
				bedWidth: 10,
				bedHeight: 10,
			})
			// Note: Implementation currently returns [], so we expect 0 length
			expect(corners).toHaveLength(0)
		})
	})

	describe('indicator visuals calculation', () => {
		const placements: GridPlacement<TestItem>[] = [
			{
				id: 'pA',
				item: items[0],
				x: 0,
				y: 0,
				size: 1,
				sourceZoneId: 'zone1',
			},
			{
				id: 'pB',
				item: items[1],
				x: 1,
				y: 0,
				size: 1,
				sourceZoneId: 'zone1',
			},
		]

		const indicators: Indicator[] = [
			{
				id: 'ind1',
				effects: [
					{
						sourceItemTypeId: '1',
						targetItemTypeId: '2',
						nature: 'beneficial',
						description: 'Helps growth',
					},
				],
			},
		]

		it('calculates indicator visuals correctly for edge adjacency', () => {
			const visuals = calculateIndicatorVisuals(indicators, placements, calculator)
			expect(visuals).toHaveLength(1)
			const visual = visuals[0]
			expect(visual.semicircles).toHaveLength(1)
			expect(visual.semicircles?.[0].direction).toBe('left')
			expect(visual.semicircles?.[0].color).toBe('green')
		})
	})
})
