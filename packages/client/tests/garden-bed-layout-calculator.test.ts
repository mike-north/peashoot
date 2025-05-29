import { describe, it, expect } from 'vitest'
import {
	GardenBedLayoutCalculator,
	getPlantCells,
	getSharedBorders,
	calculateEdgeBorders,
	isValidDrop,
} from '../src/private-lib/garden-bed-layout-calculator.js'
import type { GardenBed } from '../src/private-lib/garden-bed.js'

const layoutParams = { width: 4, height: 4 }
const layout = new GardenBedLayoutCalculator(layoutParams)

const mockPlant = {
	id: 'plant1',
	name: 'Tomato',
	icon: 'tomato.png',
	size: 1,
}

const plantPlacement = {
	plantTile: mockPlant,
	x: 1,
	y: 2,
	id: 'placement1',
}

const plantPlacement2 = {
	plantTile: { ...mockPlant, id: 'plant2' },
	x: 2,
	y: 2,
	id: 'placement2',
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
		const valid = layout.isValidPlacement(0, 0, 1, [plantPlacement])
		expect(valid).toBe(true)
		const invalid = layout.isValidPlacement(1, 2, 1, [plantPlacement])
		expect(invalid).toBe(false)
	})
})

describe('getPlantCells', () => {
	it('returns all cells for a 1x1 plant', () => {
		const cells = getPlantCells(plantPlacement)
		expect(cells).toContainEqual({ x: 1, y: 2 })
	})
	it('returns all cells for a 2x2 plant', () => {
		const cells = getPlantCells({
			...plantPlacement,
			plantTile: { ...mockPlant, size: 2 },
		})
		expect(cells.length).toBe(4)
	})
})

describe('getSharedBorders', () => {
	it('returns borders for adjacent plants', () => {
		const borders = getSharedBorders(
			plantPlacement,
			{ ...plantPlacement, x: 2, id: 'placement2' },
			'red',
			'indicator1',
			layout,
		)
		expect(Array.isArray(borders)).toBe(true)
	})
})

describe('calculateEdgeBorders', () => {
	it('returns borders for edge indicators', () => {
		const bed = { plantPlacements: [plantPlacement, plantPlacement2] }
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

describe('isValidDrop', () => {
	it('validates a drop in an empty bed', () => {
		const bed: GardenBed = {
			id: 'bed1',
			width: 4,
			height: 4,
			waterLevel: 5,
			sunLevel: 7,
			plantPlacements: [],
		}
		const valid = isValidDrop(bed, plantPlacement, 0, 0)
		expect(valid).toBe(true)
	})
	it('invalidates a drop on an occupied cell', () => {
		const bed: GardenBed = {
			id: 'bed1',
			width: 4,
			height: 4,
			waterLevel: 5,
			sunLevel: 7,
			plantPlacements: [plantPlacement],
		}
		const valid = isValidDrop(bed, { ...plantPlacement, id: 'placement2' }, 1, 2)
		expect(valid).toBe(false)
	})
})
