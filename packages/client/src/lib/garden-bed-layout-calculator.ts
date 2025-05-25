// Layout calculator for garden bed and tiles

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
  cellSize: number;
  paddingTop: number;
  paddingLeft: number;
  paddingBottom: number;
  paddingRight: number;
  frameThickness: number;
}

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
    this.cellSize = params.cellSize;
    this.paddingTop = params.paddingTop;
    this.paddingLeft = params.paddingLeft;
    this.paddingBottom = params.paddingBottom;
    this.paddingRight = params.paddingRight;
    this.frameThickness = params.frameThickness;
  }

  /**
   * Total SVG width for the garden bed, including padding and frame.
   */
  get svgWidth(): number {
    return (
      this.paddingLeft + this.paddingRight + this.frameThickness + this.width * this.cellSize
    );
  }
  /**
   * Total SVG height for the garden bed, including padding and frame.
   */
  get svgHeight(): number {
    return (
      this.paddingTop + this.paddingBottom + this.frameThickness + this.height * this.cellSize
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
  getVerticalLines(): { x: number; y1: number; y2: number }[] {
    return Array.from({ length: this.width - 1 }, (_, i) => ({
      x: this.interiorX + (i + 1) * this.cellWidth,
      y1: this.interiorY,
      y2: this.interiorY + this.interiorHeight,
    }));
  }
  /**
   * Returns the positions of all horizontal grid lines.
   */
  getHorizontalLines(): { y: number; x1: number; x2: number }[] {
    return Array.from({ length: this.height - 1 }, (_, i) => ({
      y: this.interiorY + (i + 1) * this.cellHeight,
      x1: this.interiorX,
      x2: this.interiorX + this.interiorWidth,
    }));
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
    bedHeight
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
    if (isTop && isLeft) corners.push('top-left');
    if (isTop && isRight) corners.push('top-right');
    if (isBottom && isLeft) corners.push('bottom-left');
    if (isBottom && isRight) corners.push('bottom-right');
    return corners;
  }
} 