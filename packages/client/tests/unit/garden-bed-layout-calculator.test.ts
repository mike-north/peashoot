import { describe, it, expect } from 'vitest'
import { ZoneLayoutCalculator } from '../../src/private/grid/zone-layout-calculator.js'
import {
	type GridPlaceable,
	type GridPlacement,
} from '../../src/private/grid/grid-placement.js'
import { type PlantMetadata } from '../../src/lib/entities/plant-metadata.js'
import { type Item } from '../../src/lib/entities/item.js'
import { type ItemInZone } from '../../src/private/dnd/types.js'
import { type WithId } from '../../src/lib/entities/with-id.js'

const layoutParams = { width: 4, height: 4, tileSizeForItem: () => 1 }
const layout = new ZoneLayoutCalculator(layoutParams)

const mockItem: Item<PlantMetadata> & WithId & GridPlaceable = {
	id: 'plant_1',
	displayName: 'Tomato',
	category: 'tomatoes',
	variant: 'red',
	size: 2,
	metadata: {
		family: 'tomatoes',
		plantingDistanceInFeet: 2,
	},
	presentation: {
		accentColor: {
			red: 255,
			green: 0,
			blue: 0,
		},
		iconPath: 'tomato.png',
	},
}

const itemPlacement: GridPlacement<Item<PlantMetadata>> &
	ItemInZone<Item<PlantMetadata>> = {
	x: 1,
	y: 2,
	id: 'placement1',
	size: 1,
	item: mockItem,
	sourceZoneId: 'zone1',
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
		const valid = layout.isValidPlacement(0, 0, 1, [itemPlacement])
		expect(valid).toBe(true)
		const invalid = layout.isValidPlacement(1, 2, 1, [itemPlacement])
		expect(invalid).toBe(false)
	})
})
