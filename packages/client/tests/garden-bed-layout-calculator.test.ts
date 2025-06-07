import { describe, it, expect } from 'vitest'
import {
	ZoneLayoutCalculator,
	calculateEdgeBorders,
} from '../src/private/grid/zone-layout-calculator.js'
import type { PlantItem } from '../src/lib/item-types/plant-item.js'
import { createPlantItem } from '../src/lib/item-types/plant-item.js'
import type { GridPlacement } from '../src/private/grid/grid-placement.js'
import { ExistingDraggableItem } from '../src/private/dnd/types.js'

const layoutParams = { width: 4, height: 4, tileSizeForItem: () => 1 }
const layout = new ZoneLayoutCalculator(layoutParams)

const mockItem: PlantItem = createPlantItem({
	id: 'plant_1',
	displayName: 'Tomato',
	family: 'tomatoes',
	variant: 'red',
	plantingDistanceInFeet: 2,
	presentation: {
		accentColor: {
			red: 255,
			green: 0,
			blue: 0,
		},
		iconPath: 'tomato.png',
		size: 2,
	},
})

const itemPlacement: GridPlacement<PlantItem> & ExistingDraggableItem<PlantItem> = {
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
	item: mockItem,
	sourceZoneId: 'zone1',
}

const itemTileObjectWithId = {
	x: 1,
	y: 2,
	id: 'placement1',
	plantTile: { ...mockItem, size: 1 },
}

const itemTileObject2WithId = {
	x: 2,
	y: 2,
	id: 'placement2',
	plantTile: { ...mockItem, size: 1 },
}

describe('ZoneLayoutCalculator', () => {
	it('calculates svgWidth and svgHeight', () => {
		expect(layout.svgWidth).toBeGreaterThan(0)
		expect(layout.svgHeight).toBeGreaterThan(0)
	})

	it('converts zone coordinates to SVG coordinates', () => {
		expect(typeof layout.zoneToSvgX(0)).toBe('number')
		expect(typeof layout.zoneToSvgY(0)).toBe('number')
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
		const placementWithSize = { ...itemPlacement, size: 1, id: 'placement1' }
		const valid = layout.isValidPlacement([mockItem], 0, 0, 1, [placementWithSize])
		expect(valid).toBe(true)
		const invalid = layout.isValidPlacement([mockItem], 1, 2, 1, [placementWithSize])
		expect(invalid).toBe(false)
	})
})

describe('calculateEdgeBorders', () => {
	it('returns borders for edge indicators', () => {
		const zone = {
			plantPlacements: [itemTileObjectWithId, itemTileObject2WithId],
		}
		const edgeIndicators = [
			{
				id: 'e1',
				plantAId: 'placement1',
				plantBId: 'placement2',
				color: 'blue',
			},
		]
		const borders = calculateEdgeBorders(zone, edgeIndicators, layout)
		expect(Array.isArray(borders)).toBe(true)
	})
})
