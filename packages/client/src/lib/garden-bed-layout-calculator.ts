// Layout calculator for garden bed and tiles

import { makePoint, type Line } from "./types/geometry";
import type { Keyed } from "./types/ui";
import { DEFAULT_LAYOUT_PARAMS } from "./layout-constants";
import type { GardenBed } from "./garden-bed";
import type { PlantPlacement } from "./plant-placement";

/**
 * Layout information for a plant tile, used by PlantPlacementTile.svelte.
 */
export interface PlantTileLayoutInfo {
  /** SVG X coordinate (top-left) for the tile */
  svgX: number;
  /** SVG Y coordinate (top-left) for the tile */
  svgY: number;
  /** Width of the tile in SVG units */
  width: number;
  /** Height of the tile in SVG units */
  height: number;
  /** X coordinate for the icon center within the tile */
  iconX: number;
  /** Y coordinate for the icon center within the tile */
  iconY: number;
  /** Icon size (diameter) in SVG units */
  iconSize: number;
}

/**
 * Parameters for garden bed layout calculations.
 */
export interface LayoutParams {
  width: number;
  height: number;
  cellSize?: number;
  paddingTop?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;
  frameThickness?: number;
}

export type GridLine = Line & Keyed;

/**
 * Handles all layout calculations for a square foot garden bed and its plant tiles.
 * Provides methods to convert between garden grid coordinates and SVG coordinates,
 * and to retrieve all relevant layout parameters for rendering.
 */
export class GardenBedLayoutCalculator {
  public readonly width: number;
  public readonly height: number;
  public readonly cellSize: number;
  public readonly paddingTop: number;
  public readonly paddingLeft: number;
  public readonly paddingBottom: number;
  public readonly paddingRight: number;
  public readonly frameThickness: number;

  /**
   * @param params Layout parameters for the garden bed
   */
  constructor(params: LayoutParams) {
    this.width = params.width;
    this.height = params.height;
    this.cellSize = params.cellSize ?? DEFAULT_LAYOUT_PARAMS.cellSize;
    this.paddingTop = params.paddingTop ?? DEFAULT_LAYOUT_PARAMS.paddingTop;
    this.paddingLeft = params.paddingLeft ?? DEFAULT_LAYOUT_PARAMS.paddingLeft;
    this.paddingBottom = params.paddingBottom ?? DEFAULT_LAYOUT_PARAMS.paddingBottom;
    this.paddingRight = params.paddingRight ?? DEFAULT_LAYOUT_PARAMS.paddingRight;
    this.frameThickness = params.frameThickness ?? DEFAULT_LAYOUT_PARAMS.frameThickness;
  }

  /**
   * Total SVG width for the garden bed, including padding and frame.
   */
  get svgWidth(): number {
    return (
      this.paddingLeft +
      this.paddingRight +
      this.frameThickness +
      this.width * this.cellSize
    );
  }
  /**
   * Total SVG height for the garden bed, including padding and frame.
   */
  get svgHeight(): number {
    return (
      this.paddingTop +
      this.paddingBottom +
      this.frameThickness +
      this.height * this.cellSize
    );
  }
  /**
   * X coordinate of the frame (top-left corner).
   */
  get frameX(): number {
    return this.paddingLeft;
  }
  /**
   * Y coordinate of the frame (top-left corner).
   */
  get frameY(): number {
    return this.paddingTop;
  }
  /**
   * Width of the frame (excluding padding).
   */
  get frameWidth(): number {
    return this.svgWidth - (this.paddingLeft + this.paddingRight);
  }
  /**
   * Height of the frame (excluding padding).
   */
  get frameHeight(): number {
    return this.svgHeight - (this.paddingTop + this.paddingBottom);
  }
  /**
   * X coordinate of the interior (plantable area, inside the frame).
   */
  get interiorX(): number {
    return this.frameX + this.frameThickness / 2;
  }
  /**
   * Y coordinate of the interior (plantable area, inside the frame).
   */
  get interiorY(): number {
    return this.frameY + this.frameThickness / 2;
  }
  /**
   * Width of the interior (plantable area, inside the frame).
   */
  get interiorWidth(): number {
    return this.frameWidth - this.frameThickness;
  }
  /**
   * Height of the interior (plantable area, inside the frame).
   */
  get interiorHeight(): number {
    return this.frameHeight - this.frameThickness;
  }
  /**
   * Width of a single cell in SVG units.
   */
  get cellWidth(): number {
    return this.cellSize;
  }
  /**
   * Height of a single cell in SVG units.
   */
  get cellHeight(): number {
    return this.cellSize;
  }

  /**
   * Converts a garden grid X coordinate (0 = left) to SVG X coordinate.
   * @param gardenX X position in the garden grid
   * @returns SVG X coordinate
   */
  gardenToSvgX(gardenX: number): number {
    return this.interiorX + gardenX * this.cellWidth;
  }
  /**
   * Converts a garden grid Y coordinate (0 = bottom) to SVG Y coordinate.
   * @param gardenY Y position in the garden grid
   * @returns SVG Y coordinate
   */
  gardenToSvgY(gardenY: number): number {
    return this.interiorY + (this.height - gardenY - 1) * this.cellHeight;
  }

  /**
   * Returns the positions of all vertical grid lines.
   */
  getVerticalLines(): GridLine[] {
    return Array.from({ length: this.width - 1 }, (_, i) => {
      const x = this.interiorX + (i + 1) * this.cellWidth;
      const y1 = this.interiorY;
      const y2 = this.interiorY + this.interiorHeight;
      const key = `vertical-${i}`;
      return {
        points: [makePoint({ x: x, y: y1 }), makePoint({ x: x, y: y2 })],
        key,
      } satisfies GridLine;
    });
  }
  /**
   * Returns the positions of all horizontal grid lines.
   */
  getHorizontalLines(): GridLine[] {
    return Array.from({ length: this.height - 1 }, (_, i) => {
      const y = this.interiorY + (i + 1) * this.cellHeight;
      const x1 = this.interiorX;
      const x2 = this.interiorX + this.interiorWidth;
      const key = `horizontal-${i}`;
      return {
        points: [makePoint({ x: x1, y: y }), makePoint({ x: x2, y: y })],
        key,
      } satisfies GridLine;
    });
  }

  /**
   * Returns layout information for a plant tile at a given grid position and size.
   * @param params.x X position in the garden grid (leftmost cell)
   * @param params.y Y position in the garden grid (bottom cell)
   * @param params.size Size of the tile (default: 1)
   * @returns Layout info for the tile
   */
  getTileLayoutInfo({
    x,
    y,
    size = 1,
  }: {
    x: number;
    y: number;
    size?: number;
  }): PlantTileLayoutInfo {
    const width = this.cellWidth * size;
    const height = this.cellHeight * size;
    // The tile's bottom-left is at (x, y), but we want the SVG top-left
    const svgX = this.gardenToSvgX(x);
    const svgY = this.gardenToSvgY(y + size - 1);
    const iconSize = Math.min(width, height) * 0.3;
    const iconX = width / 2;
    const iconY = height / 2;
    return { svgX, svgY, width, height, iconX, iconY, iconSize };
  }

  /**
   * Returns layout information for a plant tile overlay, expanded by a given stroke width in all directions.
   * @param params.x X position in the garden grid (leftmost cell)
   * @param params.y Y position in the garden grid (bottom cell)
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
    x: number;
    y: number;
    size?: number;
    strokeWidth?: number;
  }): PlantTileLayoutInfo {
    const base = this.getTileLayoutInfo({ x, y, size });
    const half = strokeWidth / 2;
    return {
      ...base,
      svgX: base.svgX - half,
      svgY: base.svgY - half,
      width: base.width + strokeWidth,
      height: base.height + strokeWidth,
    };
  }

  /**
   * Returns which corners of a tile are against the frame wall.
   * @param x X position in the garden grid (leftmost cell)
   * @param y Y position in the garden grid (bottom cell)
   * @param size Size of the tile (default: 1)
   * @param bedWidth Width of the bed (in grid units)
   * @param bedHeight Height of the bed (in grid units)
   * @returns Array of strings: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
   */
  getTileFrameCornerPositions({
    x,
    y,
    size = 1,
    bedWidth,
    bedHeight,
  }: {
    x: number;
    y: number;
    size?: number;
    bedWidth: number;
    bedHeight: number;
  }): string[] {
    const corners: string[] = [];
    const isTop = y + size === bedHeight;
    const isBottom = y === 0;
    const isLeft = x === 0;
    const isRight = x + size === bedWidth;
    if (isTop && isLeft) corners.push("top-left");
    if (isTop && isRight) corners.push("top-right");
    if (isBottom && isLeft) corners.push("bottom-left");
    if (isBottom && isRight) corners.push("bottom-right");
    return corners;
  }

  /**
   * Checks if a placement is valid (no overlap, in bounds) for this bed.
   * Skips a plant with skipId (for drag/move scenarios).
   */
  isValidPlacement(
    x: number,
    y: number,
    size: number,
    plantPlacements: { x: number; y: number; id: string; plantTile: { size?: number } }[],
    skipId?: string
  ): boolean {
    if (x < 0 || y < 0 || x + size > this.width || y + size > this.height) return false;
    for (const p of plantPlacements) {
      if (skipId && p.id === skipId) continue;
      const pSize = p.plantTile.size || 1;
      for (let dx = 0; dx < size; dx++) {
        for (let dy = 0; dy < size; dy++) {
          const cellX = x + dx;
          const cellY = y + dy;
          for (let pdx = 0; pdx < pSize; pdx++) {
            for (let pdy = 0; pdy < pSize; pdy++) {
              if (cellX === p.x + pdx && cellY === p.y + pdy) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }
}

// --- Placement and Edge Indicator Types ---
export interface Cell {
  x: number;
  y: number;
}

export interface Border extends Line, Keyed {
  color: string;
}

// --- Placement and Edge Indicator Utilities ---

/**
 * Returns all grid cells occupied by a plant placement.
 */
export function getPlantCells(placement: { x: number; y: number; plantTile: { size?: number } }): Cell[] {
  const size = placement.plantTile.size || 1;
  const cells: Cell[] = [];
  for (let dx = 0; dx < size; dx++) {
    for (let dy = 0; dy < size; dy++) {
      cells.push({ x: placement.x + dx, y: placement.y + dy });
    }
  }
  return cells;
}

/**
 * Returns all shared borders between two plant placements in a bed, for edge indicators.
 */
export function getSharedBorders(
  plantA: { x: number; y: number; id: string; plantTile: { size?: number } },
  plantB: { x: number; y: number; id: string; plantTile: { size?: number } },
  color: string,
  indicatorId: string,
  layout: GardenBedLayoutCalculator
): Border[] {
  const aCells = getPlantCells(plantA);
  const bCells = getPlantCells(plantB);
  const bCellSet = new Set(bCells.map((c) => `${c.x},${c.y}`));
  const borders: Border[] = [];
  let segmentIndex = 0; // Initialize segment index for unique keys

  for (const cell of aCells) {
    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    for (const { dx, dy } of neighbors) {
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      if (bCellSet.has(`${nx},${ny}`)) {
        // Only draw the border if (plantA.id, cell.x, cell.y) < (plantB.id, nx, ny) to avoid double-drawing
        if (
          plantA.id < plantB.id ||
          (plantA.id === plantB.id && (cell.x < nx || (cell.x === nx && cell.y < ny)))
        ) {
          // Horizontal adjacency
          if (Math.abs(cell.x - nx) === 1 && cell.y === ny) {
            const leftX = Math.min(cell.x, nx);
            const y = cell.y;
            const tile = layout.getTileLayoutInfo({ x: leftX, y });
            const xEdge = tile.svgX + tile.width;
            const yTop = tile.svgY;
            const yBot = tile.svgY + tile.height;
            borders.push({
              points: [makePoint({ x: xEdge, y: yTop }), makePoint({ x: xEdge, y: yBot })],
              color,
              key: `${indicatorId}_${segmentIndex++}`, // Append segment index for unique key
            });
          }
          // Vertical adjacency
          if (Math.abs(cell.y - ny) === 1 && cell.x === nx) {
            const x = cell.x;
            const lowY = Math.min(cell.y, ny);
            const tile = layout.getTileLayoutInfo({ x, y: lowY });
            const yEdge = tile.svgY;
            const xLeft = tile.svgX;
            const xRight = tile.svgX + tile.width;
            borders.push({
              points: [makePoint({ x: xLeft, y: yEdge }), makePoint({ x: xRight, y: yEdge })],
              color,
              key: `${indicatorId}_${segmentIndex++}`, // Append segment index for unique key
            });
          }
        }
      }
    }
  }
  return borders;
}

/**
 * Calculates all edge indicator borders for a bed.
 */
export function calculateEdgeBorders(
  bed: { plantPlacements: { x: number; y: number; id: string; plantTile: { size?: number } }[] },
  edgeIndicators: { id: string; plantAId: string; plantBId: string; color: string }[],
  layout: GardenBedLayoutCalculator
): Border[] {
  let borders: Border[] = [];
  for (const indicator of edgeIndicators) {
    const plantA = bed.plantPlacements.find((p) => p.id === indicator.plantAId);
    const plantB = bed.plantPlacements.find((p) => p.id === indicator.plantBId);
    if (plantA && plantB) {
      borders = borders.concat(getSharedBorders(plantA, plantB, indicator.color, indicator.id, layout));
    }
  }
  return borders;
}

/**
 * Converts screen (client) coordinates to grid coordinates for a given SVG element and layout.
 */
export function screenToGridCoordinates(
  svgElement: SVGSVGElement,
  layout: GardenBedLayoutCalculator,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const pt = svgElement.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgElement.getScreenCTM();
  if (!ctm) throw new Error("ctm is null");
  const cursorpt = pt.matrixTransform(ctm.inverse());
  const x = Math.max(0, Math.min(layout.width - 1,
    Math.round((cursorpt.x - layout.interiorX) / layout.cellWidth)
  ));
  const y = Math.max(0, Math.min(layout.height - 1,
    layout.height - 1 - Math.round((cursorpt.y - layout.interiorY) / layout.cellHeight)
  ));
  return { x, y };
}

/**
 * Checks if a proposed plant placement (drop) is valid within a target bed.
 * This is a higher-level function often used during drag-and-drop operations.
 */
export function isValidDrop(
  targetBed: GardenBed,
  draggedPlant: PlantPlacement,
  x: number, // Target grid x-coordinate
  y: number, // Target grid y-coordinate
  layoutParamsOverrides?: Partial<LayoutParams> // Optional overrides for layout calculation
): boolean {
  const layout = new GardenBedLayoutCalculator({
    width: targetBed.width,
    height: targetBed.height,
    ...DEFAULT_LAYOUT_PARAMS, // Start with defaults
    ...(layoutParamsOverrides || {}), // Apply any specific overrides
  });
  const size = draggedPlant.plantTile.size || 1;
  return layout.isValidPlacement(
    x,
    y,
    size,
    targetBed.plantPlacements,
    draggedPlant.id
  );
}
