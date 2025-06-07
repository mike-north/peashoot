import { makePoint, type Line } from '../types/geometry'
import { DEFAULT_LAYOUT_PARAMS } from './grid-layout-constants'
import type { GridPlaceable, GridPlacement } from './grid-placement'
import type { Workspace } from '../../lib/entities/workspace'

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
