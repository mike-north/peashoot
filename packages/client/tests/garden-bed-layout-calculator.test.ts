import { describe, it, expect } from 'vitest'
import {
	GardenBedLayoutCalculator,
	getPlantCells,
	getSharedBorders,
	calculateEdgeBorders,
} from '../src/private-lib/garden-bed-layout-calculator.js'
import type { PlantWithSize } from '../src/lib/garden-bed.js'
import type { Plant } from '../src/lib/plant.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'

const layoutParams = { width: 4, height: 4, tileSizeForItem: () => 1 }
const layout = new GardenBedLayoutCalculator(layoutParams)

const mockPlant: Plant = {
	id: 'plant_1',
	displayName: 'Tomato',
	family: 'Tomato',
	variant: 'red',
	plantingDistanceInFeet: 2,
	presentation: {
		size: 2,
		accentColor: {
			r: 1,
			g: 0,
			b: 0,
		},
		iconPath: 'tomato.png',
	},
}

const plantPlacement: GridPlacement<PlantWithSize> = {
	item: mockPlant,
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
	sourceZoneId: 'bed1',
}

// Separate objects for tests that need different structures
const plantTileObject = {
	x: 1,
	y: 2,
	plantTile: { ...mockPlant, size: 1 },
}

const plantTileObjectWithId = {
	x: 1,
	y: 2,
	id: 'placement1',
	plantTile: { ...mockPlant, size: 1 },
}

const plantTileObject2WithId = {
	x: 2,
	y: 2,
	id: 'placement2',
	plantTile: { ...mockPlant, size: 1 },
}

describe('GardenBedLayoutCalculator', () => {
	it('calculates svgWidth and svgHeight', () => {
		expect(layout.svgWidth).toBeGreaterThan(0)
		expect(layout.svgHeight).toBeGreaterThan(0)
	})

	it('converts garden to SVG coordinates', () => {
		expect(typeof layout.gardenToSvgX(0)).toBe('number')
		expect(typeof layout.gardenToSvgY(0)).toBe('number')
	})

	it('returns correct tile layout info', () => {
		const info = layout.getTileLayoutInfo({ x: 1, y: 1, size: 1 })
		expect(info).toHaveProperty('svgX')
		expect(info).toHaveProperty('svgY')
		expect(info).toHaveProperty('width')
		expect(info).toHaveProperty('height')
	})

	it('returns correct tile overlay layout info', () => {
		const info = layout.getTileOverlayLayoutInfo({
			x: 1,
			y: 1,
			size: 1,
			strokeWidth: 2,
		})
		expect(info.width).toBeGreaterThan(
			layout.getTileLayoutInfo({ x: 1, y: 1, size: 1 }).width,
		)
	})

	it('returns correct frame corner positions', () => {
		const corners = layout.getTileFrameCornerPositions({
			x: 0,
			y: 0,
			bedWidth: 4,
			bedHeight: 4,
		})
		expect(Array.isArray(corners)).toBe(true)
	})

	it('validates placement in bounds and no overlap', () => {
		const placementWithSize = { ...plantPlacement, size: 1, id: 'placement1' }
		const valid = layout.isValidPlacement([mockPlant], 0, 0, 1, [placementWithSize])
		expect(valid).toBe(true)
		const invalid = layout.isValidPlacement([mockPlant], 1, 2, 1, [placementWithSize])
		expect(invalid).toBe(false)
	})
})

describe('getPlantCells', () => {
	it('returns all cells for a 1x1 plant', () => {
		const cells = getPlantCells(plantTileObject)
		expect(cells).toContainEqual({ x: 1, y: 2 })
	})
	it('returns all cells for a 2x2 plant', () => {
		const cells = getPlantCells({
			...plantTileObject,
			plantTile: { ...mockPlant, size: 2 },
		})
		expect(cells.length).toBe(4)
	})
})

describe('getSharedBorders', () => {
	it('returns borders for adjacent plants', () => {
		const borders = getSharedBorders(
			plantTileObjectWithId,
			plantTileObject2WithId,
			'red',
			'indicator1',
			layout,
		)
		expect(Array.isArray(borders)).toBe(true)
	})
})

describe('calculateEdgeBorders', () => {
	it('returns borders for edge indicators', () => {
		const bed = {
			plantPlacements: [plantTileObjectWithId, plantTileObject2WithId],
		}
		const edgeIndicators = [
			{
				id: 'e1',
				plantAId: 'placement1',
				plantBId: 'placement2',
				color: 'blue',
			},
		]
		const borders = calculateEdgeBorders(bed, edgeIndicators, layout)
		expect(Array.isArray(borders)).toBe(true)
	})
})
