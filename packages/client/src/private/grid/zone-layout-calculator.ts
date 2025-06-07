import { makePoint, type Line } from '../types/geometry'
import { DEFAULT_LAYOUT_PARAMS } from './grid-layout-constants'
import type { GridPlaceable, GridPlacement } from './grid-placement'
import type { Workspace } from '../../lib/entities/workspace'

import type {
	EffectNature,
	Indicator,
	InteractionEffect,
} from '../../lib/entities/indicator'

/**
 * Layout information for an item tile, used by generic placement tiles.
 */
export interface ItemTileLayoutInfo {
	/** SVG X coordinate (top-left) for the tile */
	svgX: number
	/** SVG Y coordinate (top-left) for the tile */
	svgY: number
	/** Width of the tile in SVG units */
	width: number
	/** Height of the tile in SVG units */
	height: number
	/** X coordinate for the icon center within the tile */
	iconX: number
	/** Y coordinate for the icon center within the tile */
	iconY: number
	/** Icon size (diameter) in SVG units */
	iconSize: number
}

/**
 * Parameters for zone layout calculations.
 */
export interface LayoutParams<T> {
	width: number
	height: number
	cellSize?: number
	paddingTop?: number
	paddingLeft?: number
	paddingBottom?: number
	paddingRight?: number
	frameThickness?: number
	tileSizeForItem: (item: T) => number
}

export type GridLine = Line & { key: string }

export interface Border {
	key: string
	points: { x: number; y: number }[]
	color: string
}

/**
 * Represents a visual indicator circle rendered on the grid
 */
export interface IndicatorVisual {
	key: string
	centerX: number
	centerY: number
	radius: number
	gridX: number
	gridY: number
	indicatorIds: string[]
	sectors?: {
		sector: 0 | 1 | 2 | 3
		color: string
		opacity?: number
	}[]
	semicircles?: {
		direction: 'top' | 'bottom' | 'left' | 'right'
		color: string
	}[]
	tooltip?: string
}

/**
 * Handles all layout calculations for a zone and its item tiles.
 * Provides methods to convert between zone grid coordinates and SVG coordinates,
 * and to retrieve all relevant layout parameters for rendering.
 */
export class ZoneLayoutCalculator<T extends GridPlaceable> {
	public readonly width: number
	public readonly height: number
	public readonly cellSize: number
	public readonly paddingTop: number
	public readonly paddingLeft: number
	public readonly paddingBottom: number
	public readonly paddingRight: number
	public readonly frameThickness: number
	public readonly tileSizeForItem: (item: T) => number

	/**
	 * @param params Layout parameters for the zone
	 */
	constructor(params: LayoutParams<T>) {
		this.width = params.width
		this.height = params.height
		this.cellSize = params.cellSize ?? DEFAULT_LAYOUT_PARAMS.cellSize
		this.paddingTop = params.paddingTop ?? DEFAULT_LAYOUT_PARAMS.paddingTop
		this.paddingLeft = params.paddingLeft ?? DEFAULT_LAYOUT_PARAMS.paddingLeft
		this.paddingBottom = params.paddingBottom ?? DEFAULT_LAYOUT_PARAMS.paddingBottom
		this.paddingRight = params.paddingRight ?? DEFAULT_LAYOUT_PARAMS.paddingRight
		this.frameThickness = params.frameThickness ?? DEFAULT_LAYOUT_PARAMS.frameThickness
		this.tileSizeForItem = params.tileSizeForItem
	}

	/**
	 * Total SVG width for the zone, including padding and frame.
	 */
	get svgWidth(): number {
		return (
			this.paddingLeft +
			this.paddingRight +
			this.frameThickness +
			this.width * this.cellSize
		)
	}
	/**
	 * Total SVG height for the zone, including padding and frame.
	 */
	get svgHeight(): number {
		return (
			this.paddingTop +
			this.paddingBottom +
			this.frameThickness +
			this.height * this.cellSize
		)
	}
	/**
	 * X coordinate of the frame (top-left corner).
	 */
	get frameX(): number {
		return this.paddingLeft
	}
	/**
	 * Y coordinate of the frame (top-left corner).
	 */
	get frameY(): number {
		return this.paddingTop
	}
	/**
	 * Width of the frame (excluding padding).
	 */
	get frameWidth(): number {
		return this.svgWidth - (this.paddingLeft + this.paddingRight)
	}
	/**
	 * Height of the frame (excluding padding).
	 */
	get frameHeight(): number {
		return this.svgHeight - (this.paddingTop + this.paddingBottom)
	}
	/**
	 * X coordinate of the interior (placeable area, inside the frame).
	 */
	get interiorX(): number {
		return this.frameX + this.frameThickness / 2
	}
	/**
	 * Y coordinate of the interior (placeable area, inside the frame).
	 */
	get interiorY(): number {
		return this.frameY + this.frameThickness / 2
	}
	/**
	 * Width of the interior (placeable area, inside the frame).
	 */
	get interiorWidth(): number {
		return this.frameWidth - this.frameThickness
	}
	/**
	 * Height of the interior (placeable area, inside the frame).
	 */
	get interiorHeight(): number {
		return this.frameHeight - this.frameThickness
	}
	/**
	 * Width of a single cell in SVG units.
	 */
	get cellWidth(): number {
		return this.cellSize
	}
	/**
	 * Height of a single cell in SVG units.
	 */
	get cellHeight(): number {
		return this.cellSize
	}

	/**
	 * Converts a zone grid X coordinate (0 = left) to SVG X coordinate.
	 * @param zoneX X position in the zone grid
	 * @returns SVG X coordinate
	 */
	zoneToSvgX(zoneX: number): number {
		return this.interiorX + zoneX * this.cellWidth
	}
	/**
	 * Converts a zone grid Y coordinate (0 = bottom) to SVG Y coordinate.
	 * @param zoneY Y position in the zone grid
	 * @returns SVG Y coordinate
	 */
	zoneToSvgY(zoneY: number): number {
		return this.interiorY + (this.height - zoneY - 1) * this.cellHeight
	}

	/**
	 * Converts a zone grid Y line-coordinate (0 = bottom) to SVG Y coordinate.
	 * @param zoneY Y position in the zone grid
	 * @returns SVG Y coordinate
	 */
	gridLineToSvgY(zoneY: number): number {
		return this.interiorY + (this.height - zoneY) * this.cellHeight
	}

	/**
	 * Converts relative SVG coordinates (within the placeable area) to zone grid coordinates.
	 * @param relativeSvgX X coordinate relative to the start of the placeable area SVG.
	 * @param relativeSvgY Y coordinate relative to the start of the placeable area SVG.
	 * @returns The {x, y} grid cell, or null if outside the grid.
	 */
	getGridCellFromRelativeSvgCoords(
		relativeSvgX: number,
		relativeSvgY: number,
	): { x: number; y: number } | null {
		const gridX = Math.floor((relativeSvgX - this.interiorX) / this.cellWidth)
		// SVG Y is from top, zone Y is from bottom
		const gridY =
			this.height - 1 - Math.floor((relativeSvgY - this.interiorY) / this.cellHeight)

		if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
			return { x: gridX, y: gridY }
		}
		return null
	}

	/**
	 * Returns the positions of all vertical grid lines.
	 */
	getVerticalLines(): GridLine[] {
		return Array.from({ length: this.width - 1 }, (_, i) => {
			const x = this.interiorX + (i + 1) * this.cellWidth
			const y1 = this.interiorY
			const y2 = this.interiorY + this.interiorHeight
			const key = `vertical-${i}`
			return {
				points: [makePoint({ x: x, y: y1 }), makePoint({ x: x, y: y2 })],
				key,
			} satisfies GridLine
		})
	}
	/**
	 * Returns the positions of all horizontal grid lines.
	 */
	getHorizontalLines(): GridLine[] {
		return Array.from({ length: this.height - 1 }, (_, i) => {
			const y = this.interiorY + (i + 1) * this.cellHeight
			const x1 = this.interiorX
			const x2 = this.interiorX + this.interiorWidth
			const key = `horizontal-${i}`
			return {
				points: [makePoint({ x: x1, y: y }), makePoint({ x: x2, y: y })],
				key,
			} satisfies GridLine
		})
	}

	/**
	 * Returns layout information for an item tile at a given grid position and size.
	 * @param params.x X position in the zone grid (leftmost cell)
	 * @param params.y Y position in the zone grid (bottom cell)
	 * @param params.size Size of the tile (default: 1)
	 * @returns Layout info for the tile
	 */
	getTileLayoutInfo({
		x,
		y,
		size = 1,
	}: {
		x: number
		y: number
		size?: number
	}): ItemTileLayoutInfo {
		const width = this.cellWidth * size
		const height = this.cellHeight * size
		// The tile's bottom-left is at (x, y), but we want the SVG top-left
		const svgX = this.zoneToSvgX(x)
		const svgY = this.zoneToSvgY(y + size - 1)
		const iconSize = Math.min(width, height) * 0.3
		const iconX = width / 2
		const iconY = height / 2
		return { svgX, svgY, width, height, iconX, iconY, iconSize }
	}

	/**
	 * Returns layout information for an item tile overlay, expanded by a given stroke width in all directions.
	 * @param params.x X position in the zone grid (leftmost cell)
	 * @param params.y Y position in the zone grid (bottom cell)
	 * @param params.size Size of the tile (default: 1)
	 * @param params.strokeWidth Amount to expand the overlay (default: 2)
	 * @returns Expanded layout info for the overlay
	 */
	getTileOverlayLayoutInfo({
		x,
		y,
		size = 1,
		strokeWidth = 2,
	}: {
		x: number
		y: number
		size?: number
		strokeWidth?: number
	}): ItemTileLayoutInfo {
		const base = this.getTileLayoutInfo({ x, y, size })
		const half = strokeWidth / 2
		return {
			...base,
			svgX: base.svgX - half,
			svgY: base.svgY - half,
			width: base.width + strokeWidth,
			height: base.height + strokeWidth,
		}
	}

	/**
	 * Checks if a placement is valid (no overlap, in bounds) for this zone.
	 * Skips an item with skipId (for drag/move scenarios).
	 */
	isValidPlacement(
		items: T[],
		x: number,
		y: number,
		size: number,
		placements: GridPlacement<T>[],
		skipId?: string,
	): boolean {
		if (x < 0 || y < 0 || x + size > this.width || y + size > this.height) return false
		if (!Array.isArray(placements)) {
			console.error('placements is not an array', placements)
			throw new Error('placements is not an array')
		}
		for (const p of placements) {
			if (skipId && p.id === skipId) continue
			const pSize = p.size
			for (let dx = 0; dx < size; dx++) {
				for (let dy = 0; dy < size; dy++) {
					const cellX = x + dx
					const cellY = y + dy
					for (let pdx = 0; pdx < pSize; pdx++) {
						for (let pdy = 0; pdy < pSize; pdy++) {
							if (cellX === p.x + pdx && cellY === p.y + pdy) {
								return false
							}
						}
					}
				}
			}
		}
		return true
	}

	/**
	 * Returns the frame corner positions for a tile based on its position within the zone.
	 * Used for determining which corners should have rounded borders.
	 */
	getTileFrameCornerPositions({
		x,
		y,
		size = 1,
		bedWidth,
		bedHeight,
	}: {
		x: number
		y: number
		size?: number
		bedWidth: number
		bedHeight: number
	}): string[] {
		const corners: string[] = []

		// Check if tile is at top-left corner
		if (x === 0 && y + size === bedHeight) {
			corners.push('top-left')
		}

		// Check if tile is at top-right corner
		if (x + size === bedWidth && y + size === bedHeight) {
			corners.push('top-right')
		}

		// Check if tile is at bottom-left corner
		if (x === 0 && y === 0) {
			corners.push('bottom-left')
		}

		// Check if tile is at bottom-right corner
		if (x + size === bedWidth && y === 0) {
			corners.push('bottom-right')
		}

		return corners
	}
}

/**
 * Converts screen (client) coordinates to grid coordinates for a given SVG element and layout.
 */
export function screenToGridCoordinates<T extends GridPlaceable>(
	svgElement: SVGSVGElement,
	layout: ZoneLayoutCalculator<T>,
	clientX: number,
	clientY: number,
): { x: number; y: number } {
	const rect = svgElement.getBoundingClientRect()
	const relativeSvgX = clientX - rect.left
	const relativeSvgY = clientY - rect.top
	const gridCoords = layout.getGridCellFromRelativeSvgCoords(relativeSvgX, relativeSvgY)
	return gridCoords || { x: -1, y: -1 }
}

/**
 * Calculate column spans for zones in the workspace view
 */
export function calculateZoneViewColSpans(workspace: Workspace): Record<string, number> {
	const colSpans: Record<string, number> = {}

	// For now, use a simple algorithm that gives larger zones more column span
	for (const zone of workspace.zones) {
		const area = zone.width * zone.height
		if (area >= 20) {
			colSpans[zone.id] = 2
		} else if (area >= 10) {
			colSpans[zone.id] = 1
		} else {
			colSpans[zone.id] = 1
		}
	}

	return colSpans
}

/**
 * Calculate edge borders for the zone based on edge indicators.
 * This creates visual lines between adjacent items that have edge relationships.
 */
export function calculateEdgeBorders<T extends GridPlaceable>(
	zone: {
		plantPlacements: {
			x: number
			y: number
			id: string
			plantTile: { size: number }
		}[]
	},
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[],
	layout: ZoneLayoutCalculator<T>,
): Border[] {
	const borders: Border[] = []

	// For each edge indicator, find the corresponding placements and create borders
	for (const indicator of edgeIndicators) {
		const plantA = zone.plantPlacements.find((p) => p.id === indicator.plantAId)
		const plantB = zone.plantPlacements.find((p) => p.id === indicator.plantBId)

		if (!plantA || !plantB) continue

		// Check if plants are adjacent
		const isAdjacent =
			(Math.abs(plantA.x - plantB.x) === 1 && plantA.y === plantB.y) ||
			(Math.abs(plantA.y - plantB.y) === 1 && plantA.x === plantB.x)

		if (isAdjacent) {
			// Create a border line between the adjacent plants
			const aLayout = layout.getTileLayoutInfo({
				x: plantA.x,
				y: plantA.y,
				size: plantA.plantTile.size,
			})
			const bLayout = layout.getTileLayoutInfo({
				x: plantB.x,
				y: plantB.y,
				size: plantB.plantTile.size,
			})

			// Calculate the border line between the two tiles
			let x1: number, y1: number, x2: number, y2: number

			if (plantA.x < plantB.x) {
				// A is to the left of B
				x1 = x2 = aLayout.svgX + aLayout.width
				y1 = Math.max(aLayout.svgY, bLayout.svgY)
				y2 = Math.min(aLayout.svgY + aLayout.height, bLayout.svgY + bLayout.height)
			} else if (plantA.x > plantB.x) {
				// A is to the right of B
				x1 = x2 = aLayout.svgX
				y1 = Math.max(aLayout.svgY, bLayout.svgY)
				y2 = Math.min(aLayout.svgY + aLayout.height, bLayout.svgY + bLayout.height)
			} else if (plantA.y < plantB.y) {
				// A is below B
				y1 = y2 = aLayout.svgY + aLayout.height
				x1 = Math.max(aLayout.svgX, bLayout.svgX)
				x2 = Math.min(aLayout.svgX + aLayout.width, bLayout.svgX + bLayout.width)
			} else {
				// A is above B
				y1 = y2 = aLayout.svgY
				x1 = Math.max(aLayout.svgX, bLayout.svgX)
				x2 = Math.min(aLayout.svgX + aLayout.width, bLayout.svgX + bLayout.width)
			}

			borders.push({
				key: `edge-${indicator.id}`,
				points: [
					{ x: x1, y: y1 },
					{ x: x2, y: y2 },
				],
				color: indicator.color,
			})
		}
	}

	return borders
}

function getAdjacency<T extends GridPlaceable>(
	p1: GridPlacement<T>,
	p2: GridPlacement<T>,
):
	| { type: 'edge'; p1: { x: number; y: number }; p2: { x: number; y: number } }
	| { type: 'corner'; point: { x: number; y: number } }
	| null {
	const { x: x1, y: y1, size: s1 } = p1
	const { x: x2, y: y2, size: s2 } = p2
	const r1 = x1 + s1
	const t1 = y1 + s1
	const r2 = x2 + s2
	const t2 = y2 + s2

	// Edge
	if (r1 === x2 && Math.max(y1, y2) < Math.min(t1, t2))
		return {
			type: 'edge',
			p1: { x: r1, y: Math.max(y1, y2) },
			p2: { x: r1, y: Math.min(t1, t2) },
		}
	if (r2 === x1 && Math.max(y1, y2) < Math.min(t1, t2))
		return {
			type: 'edge',
			p1: { x: r2, y: Math.max(y1, y2) },
			p2: { x: r2, y: Math.min(t1, t2) },
		}
	if (t1 === y2 && Math.max(x1, x2) < Math.min(r1, r2))
		return {
			type: 'edge',
			p1: { y: t1, x: Math.max(x1, x2) },
			p2: { y: t1, x: Math.min(r1, r2) },
		}
	if (t2 === y1 && Math.max(x1, x2) < Math.min(r1, r2))
		return {
			type: 'edge',
			p1: { y: t2, x: Math.max(x1, x2) },
			p2: { y: t2, x: Math.min(r1, r2) },
		}

	// Corner
	if (r1 === x2 && t1 === y2) return { type: 'corner', point: { x: r1, y: t1 } }
	if (r1 === x2 && y1 === t2) return { type: 'corner', point: { x: r1, y: y1 } }
	if (x1 === r2 && t1 === y2) return { type: 'corner', point: { x: x1, y: t1 } }
	if (x1 === r2 && y1 === t2) return { type: 'corner', point: { x: x1, y: y1 } }

	return null
}

type VisualPrimitive =
	| {
			type: 'semicircle'
			position: { x: number; y: number }
			direction: 'top' | 'bottom' | 'left' | 'right'
			color: string
			indicatorId: string
			tooltip?: string
	  }
	| {
			type: 'sector'
			position: { x: number; y: number }
			sector: 0 | 1 | 2 | 3
			color: string
			indicatorId: string
			tooltip?: string
	  }

export function calculateIndicatorVisuals<T extends GridPlaceable>(
	indicators: Indicator[],
	placements: GridPlacement<T>[],
	zoneId: string,
	layout: ZoneLayoutCalculator<T>,
): IndicatorVisual[] {
	const primitives: VisualPrimitive[] = []

	for (const indicator of indicators) {
		if (indicator.zoneId !== zoneId) continue

		const { itemAId, itemBId, effectAonB, effectBonA, tooltip } = indicator

		const placementA = placements.find((p) => p.id === itemAId)
		const placementB = placements.find((p) => p.id === itemBId)

		if (!placementA || !placementB) continue

		const adjacency = getAdjacency(placementA, placementB)
		if (!adjacency) continue

		const processEffect = (
			effect: InteractionEffect | undefined,
			source: GridPlacement<T>,
			target: GridPlacement<T>,
		) => {
			if (!effect) return

			if (adjacency.type === 'edge') {
				const midPoint = {
					x: (adjacency.p1.x + adjacency.p2.x) / 2,
					y: (adjacency.p1.y + adjacency.p2.y) / 2,
				}
				const orientation = adjacency.p1.x === adjacency.p2.x ? 'vertical' : 'horizontal'
				const dir =
					orientation === 'vertical'
						? target.x < midPoint.x
							? 'right'
							: 'left'
						: target.y < midPoint.y
							? 'bottom'
							: 'top'
				const primitive: VisualPrimitive = {
					type: 'semicircle',
					position: midPoint,
					direction: dir,
					color: getColorForEffect(effect.nature),
					indicatorId: indicator.id,
				}
				if (tooltip) {
					primitive.tooltip = tooltip
				}
				primitives.push(primitive)
			} else {
				// corner
				const { point } = adjacency
				const { x, y, size } = target
				let sector: 0 | 1 | 2 | 3 = 0
				if (point.x === x + size && point.y === y + size) sector = 2 // Top-Right corner
				if (point.x === x && point.y === y + size) sector = 1 // Top-Left corner
				if (point.x === x && point.y === y) sector = 0 // Bottom-Left corner
				if (point.x === x + size && point.y === y) sector = 3 // Bottom-Right corner

				const primitive: VisualPrimitive = {
					type: 'sector',
					position: point,
					sector,
					color: getColorForEffect(effect.nature),
					indicatorId: indicator.id,
				}
				if (tooltip) {
					primitive.tooltip = tooltip
				}
				primitives.push(primitive)
			}
		}

		processEffect(effectAonB, placementA, placementB)
		processEffect(effectBonA, placementB, placementA)
	}

	// Group primitives by position
	const groupedByPosition = new Map<string, VisualPrimitive[]>()
	for (const p of primitives) {
		const key = `${p.position.x},${p.position.y}`
		if (!groupedByPosition.has(key)) {
			groupedByPosition.set(key, [])
		}
		groupedByPosition.get(key)?.push(p)
	}

	// Create final visuals
	const visuals: IndicatorVisual[] = []
	for (const [positionKey, group] of groupedByPosition.entries()) {
		const [x, y] = positionKey.split(',').map(Number)
		visuals.push({
			key: `indicator-visual-${positionKey}`,
			centerX: layout.zoneToSvgX(x),
			centerY: layout.gridLineToSvgY(y),
			radius: Math.min(layout.cellWidth, layout.cellHeight) / 4,
			gridX: x,
			gridY: y,
			indicatorIds: [...new Set(group.map((p) => p.indicatorId))],
			semicircles: group
				.filter(
					(p): p is Extract<VisualPrimitive, { type: 'semicircle' }> =>
						p.type === 'semicircle',
				)
				.map((p) => ({ direction: p.direction, color: p.color })),
			sectors: group
				.filter(
					(p): p is Extract<VisualPrimitive, { type: 'sector' }> => p.type === 'sector',
				)
				.map((p) => ({ sector: p.sector, color: p.color })),
			tooltip: group.map((p) => p.tooltip).find((t) => t) || '',
		})
	}
	return visuals
}

function getColorForEffect(nature: EffectNature): string {
	switch (nature) {
		case 'beneficial':
			return 'green'
		case 'harmful':
			return 'red'
		case 'neutral':
			return 'blue'
		default:
			// Should not happen with current data model, but provides a fallback
			return 'grey'
	}
}
