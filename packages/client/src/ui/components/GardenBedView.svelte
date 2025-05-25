<script lang="ts">
  import type { PlantPlacement } from "../../lib/plant-placement";
  import PlantPlacementTile from "./PlantPlacementTile.svelte";
  import HorizontalBarMeter from "./HorizontalBarMeter.svelte";
  import { GardenBedLayoutCalculator } from "../../lib/garden-bed-layout-calculator";
  import { dragState, isDragStatePopulated } from "../state/dragState";
  import { get } from "svelte/store";
  import type { GardenBed } from "../../lib/garden-bed";

  interface GardenBedViewProps {
    bed: GardenBed;
    onTileMouseDownFromParent?: (
      plant: PlantPlacement,
      bedId: string,
      event: MouseEvent
    ) => void;
    edgeIndicators?: {
      id: string;
      plantAId: string;
      plantBId: string;
      color: string;
    }[];
  }

  const {
    bed,
    onTileMouseDownFromParent,
    edgeIndicators = [],
  }: GardenBedViewProps = $props();
  // Instantiate the layout calculator
  const layout = new GardenBedLayoutCalculator({
    width: bed.width,
    height: bed.height,
    cellSize: 40,
    paddingTop: 2,
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
    frameThickness: 4,
  });

  // Use layout for all layout-related values
  const svgWidth = layout.svgWidth;
  const svgHeight = layout.svgHeight;
  const frameX = layout.frameX;
  const frameY = layout.frameY;
  const frameWidth = layout.frameWidth;
  const frameHeight = layout.frameHeight;
  const interiorX = layout.interiorX;
  const interiorY = layout.interiorY;
  const interiorWidth = layout.interiorWidth;
  const interiorHeight = layout.interiorHeight;
  const cellWidth = layout.cellWidth;
  const cellHeight = layout.cellHeight;

  // Grid lines
  const verticalLines = layout.getVerticalLines();
  const horizontalLines = layout.getHorizontalLines();

  // Function to convert garden coordinates (0,0 at bottom-left) to SVG coordinates
  const gardenToSvgX = (gardenX: number) => layout.gardenToSvgX(gardenX);
  const gardenToSvgY = (gardenY: number) => layout.gardenToSvgY(gardenY);

  // Create a map of plant placements for quick lookup
  const plantMap = new Map<string, PlantPlacement>();
  const occupiedCells = new Set<string>();

  bed.plantPlacements.forEach((placement) => {
    const key = `${placement.x},${placement.y}`;
    plantMap.set(key, placement);

    // Mark all cells occupied by this plant (for multi-cell plants)
    const size = placement.plantTile.size || 1;
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const cellKey = `${placement.x + dx},${placement.y + dy}`;
        occupiedCells.add(cellKey);
      }
    }
  });

  // Generate all cell positions
  const allCells: { x: number; y: number }[] = [];
  for (let y = 0; y < bed.height; y++) {
    for (let x = 0; x < bed.width; x++) {
      allCells.push({ x, y });
    }
  }

  let dragOffset: { x: number; y: number } | null = null;

  function isValidPlacement(x: number, y: number, size: number): boolean {
    if (x < 0 || y < 0 || x + size > bed.width || y + size > bed.height)
      return false;
    for (const p of bed.plantPlacements) {
      if ($dragState.draggedPlant && p.id === $dragState.draggedPlant.id)
        continue;
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

  // --- Edge Indicator Overlay Logic ---
  // For each edgeIndicator, find all shared borders between plantA and plantB in this bed
  type Cell = { x: number; y: number };
  type Border = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    id: string;
  };

  function getPlantCells(placement: PlantPlacement): Cell[] {
    const size = placement.plantTile.size || 1;
    const cells: Cell[] = [];
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        cells.push({ x: placement.x + dx, y: placement.y + dy });
      }
    }
    return cells;
  }

  function getSharedBorders(
    plantA: PlantPlacement,
    plantB: PlantPlacement,
    color: string,
    indicatorId: string
  ): Border[] {
    const aCells = getPlantCells(plantA);
    const bCells = getPlantCells(plantB);
    const bCellSet = new Set(bCells.map((c) => `${c.x},${c.y}`));
    const borders: Border[] = [];
    // For each cell in A, check its 4 neighbors; if neighbor is in B, add the shared border
    for (const cell of aCells) {
      const neighbors = [
        { dx: 1, dy: 0, edge: "right" },
        { dx: -1, dy: 0, edge: "left" },
        { dx: 0, dy: 1, edge: "top" },
        { dx: 0, dy: -1, edge: "bottom" },
      ];
      for (const { dx, dy } of neighbors) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (bCellSet.has(`${nx},${ny}`)) {
          // Only draw the border if (plantA.id, cell.x, cell.y) < (plantB.id, nx, ny) to avoid double-drawing
          if (
            plantA.id < plantB.id ||
            (plantA.id === plantB.id &&
              (cell.x < nx || (cell.x === nx && cell.y < ny)))
          ) {
            // Horizontal adjacency
            if (Math.abs(cell.x - nx) === 1 && cell.y === ny) {
              // Always use the leftmost cell for the edge
              const leftX = Math.min(cell.x, nx);
              const y = cell.y;
              const tile = layout.getTileLayoutInfo({ x: leftX, y });
              const xEdge = tile.svgX + tile.width;
              const yTop = tile.svgY;
              const yBot = tile.svgY + tile.height;
              borders.push({
                x1: xEdge,
                y1: yTop,
                x2: xEdge,
                y2: yBot,
                color,
                id: indicatorId,
              });
            }
            // Vertical adjacency
            if (Math.abs(cell.y - ny) === 1 && cell.x === nx) {
              // Always use the lower cell for the edge
              const x = cell.x;
              const lowY = Math.min(cell.y, ny);
              const tile = layout.getTileLayoutInfo({ x, y: lowY });
              const yEdge = tile.svgY;
              const xLeft = tile.svgX;
              const xRight = tile.svgX + tile.width;
              borders.push({
                x1: xLeft,
                y1: yEdge,
                x2: xRight,
                y2: yEdge,
                color,
                id: indicatorId,
              });
            }
          }
        }
      }
    }
    return borders;
  }

  // Make sure calculateEdgeBorders is defined above the effect
  function calculateEdgeBorders(): Border[] {
    let borders: Border[] = [];
    if (edgeIndicators && edgeIndicators.length > 0) {
      for (const indicator of edgeIndicators) {
        const plantA = bed.plantPlacements.find(
          (p) => p.id === indicator.plantAId
        );
        const plantB = bed.plantPlacements.find(
          (p) => p.id === indicator.plantBId
        );
        if (plantA && plantB) {
          borders = borders.concat(
            getSharedBorders(plantA, plantB, indicator.color, indicator.id)
          );
        }
      }
    }
    return borders;
  }

  let edgeBorders = $state<Border[]>([]);
  $effect(() => {
    const newBorders = calculateEdgeBorders();
    // Only update if different (shallow compare for arrays of objects)
    if (
      newBorders.length !== edgeBorders.length ||
      newBorders.some(
        (b, i) => JSON.stringify(b) !== JSON.stringify(edgeBorders[i])
      )
    ) {
      edgeBorders = newBorders;
    }
  });
  // DEBUG: Log edgeIndicators and plant IDs in this bed
  bed.plantPlacements.forEach((p) => p.id);
</script>

<!-- Title and meters OUTSIDE the .raised-bed box -->
<div class="raised-bed__title">
  Raised Garden Bed ({bed.width}×{bed.height} feet)
</div>
<div class="raised-bed__meters-row">
  <HorizontalBarMeter
    value={bed.waterLevel}
    max={5}
    filledColor="#3498db"
    emptyColor="#3498db22"
    borderColor="#3498db"
    label="Water"
    labelColor="#3498db"
  />
  <HorizontalBarMeter
    value={bed.sunLevel}
    max={5}
    filledColor="#FFD600"
    emptyColor="#FFD60022"
    borderColor="#FFD600"
    label="Sun"
    labelColor="#FF6666"
  />
</div>

<!-- The actual bed, grid, overlays, and frame -->
<div
  class="raised-bed"
  data-bed-id={bed.id}
  style="width: {svgWidth}px; height: {svgHeight}px;"
>
  <!-- SVG Plantable Area and Grid (background) -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 {svgWidth} {svgHeight}"
    width={svgWidth}
    height={svgHeight}
    style="position: absolute; left: 0; top: 0; z-index: 1;"
  >
    <rect
      x={interiorX}
      y={interiorY}
      width={interiorWidth}
      height={interiorHeight}
      class="raised-bed__plantable-area"
      opacity="0.2"
    />
    <!-- Grid lines -->
    {#each verticalLines as line}
      <line
        x1={line.x}
        y1={line.y1}
        x2={line.x}
        y2={line.y2}
        class="raised-bed__grid-line"
      />
    {/each}
    {#each horizontalLines as line}
      <line
        x1={line.x1}
        y1={line.y}
        x2={line.x2}
        y2={line.y}
        class="raised-bed__grid-line"
      />
    {/each}
    <!-- Edge Indicator Lines -->
    {#each edgeBorders as border (border.id + "-" + border.x1 + "-" + border.y1 + "-" + border.x2 + "-" + border.y2)}
      <line
        x1={border.x1}
        y1={border.y1}
        x2={border.x2}
        y2={border.y2}
        stroke={border.color}
        stroke-width={layout.frameThickness}
        stroke-linecap="round"
        opacity="0.95"
      />
    {/each}
    {#if bed.width <= 8 && bed.height <= 8}
      <g id="raised-bed__coordinate-labels" opacity="0.6">
        {#each Array.from({ length: bed.width }, (_, i) => i) as x}
          <text
            x={gardenToSvgX(x) + cellWidth / 2}
            y={svgHeight - 5}
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="10"
            class="slate-label-gray"
          >
            {x}
          </text>
        {/each}
        {#each Array.from({ length: bed.height }, (_, i) => i) as y}
          <text
            x="5"
            y={gardenToSvgY(y) + cellHeight / 2 + 3}
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="10"
            class="slate-label-gray"
          >
            {y}
          </text>
        {/each}
      </g>
    {/if}
  </svg>

  <!-- HTML Plant Tiles (middle layer) -->
  <div class="tile-overlay" style="width: {svgWidth}px; height: {svgHeight}px;">
    <div
      class="tile-overlay__tiles"
      style="width: {svgWidth}px; height: {svgHeight}px; position: relative;"
    >
      {#if $dragState.targetBedId === bed.id && $dragState.highlightedCell && $dragState.draggedPlant}
        {@const size = isDragStatePopulated($dragState)
          ? $dragState.draggedTileSize
          : 1}
        {@const tileLayout = layout.getTileLayoutInfo({
          x: $dragState.highlightedCell.x,
          y: $dragState.highlightedCell.y,
          size,
        })}
        {@const valid = isValidPlacement(
          $dragState.highlightedCell.x,
          $dragState.highlightedCell.y,
          size
        )}
        {@const isSource = $dragState.sourceBedId === bed.id}
        <div
          class="tile-overlay__highlight
            {valid ? '' : 'tile-overlay__highlight--invalid'}
            {valid && isSource ? 'tile-overlay__highlight--source' : ''}
            {valid && !isSource ? 'tile-overlay__highlight--target' : ''}"
          style="
            left: {tileLayout.svgX}px;
            top: {tileLayout.svgY}px;
            width: {tileLayout.width}px;
            height: {tileLayout.height}px;
          "
        ></div>
      {/if}
      {#each bed.plantPlacements as placement (placement.id)}
        {@const size = placement.plantTile.size || 1}
        {@const tileLayout = layout.getTileLayoutInfo({
          x: placement.x,
          y: placement.y,
          size,
        })}
        {@const overlayLayout = layout.getTileOverlayLayoutInfo({
          x: placement.x,
          y: placement.y,
          size,
          strokeWidth: 2,
        })}
        {@const isTop = placement.y + size === bed.height}
        {@const isBottom = placement.y === 0}
        {@const isLeft = placement.x === 0}
        {@const isRight = placement.x + size === bed.width}
        {@const corners = layout.getTileFrameCornerPositions({
          x: placement.x,
          y: placement.y,
          size,
          bedWidth: bed.width,
          bedHeight: bed.height,
        })}
        {@const borderRadiusStyle = corners
          .map((corner) => `border-${corner}-radius: 8px;`)
          .join(" ")}
        <div
          class="tile-overlay__tile"
          style="
          left: {$dragState.draggedPlant &&
          $dragState.draggedPlant.id === placement.id &&
          $dragState.dragPosition &&
          dragOffset
            ? $dragState.dragPosition.x - dragOffset.x - 1
            : overlayLayout.svgX}px;
            top: {$dragState.draggedPlant &&
          $dragState.draggedPlant.id === placement.id &&
          $dragState.dragPosition &&
          dragOffset
            ? $dragState.dragPosition.y - dragOffset.y - 1
            : overlayLayout.svgY}px;
            width: {overlayLayout.width}px;
            height: {overlayLayout.height}px;
            z-index: {$dragState.draggedPlant &&
          $dragState.draggedPlant.id === placement.id
            ? 100
            : 2};
            opacity: {$dragState.draggedPlant &&
          $dragState.draggedPlant.id === placement.id
            ? 0.7
            : 1};
            pointer-events: {$dragState.draggedPlant &&
          $dragState.draggedPlant.id !== placement.id
            ? 'none'
            : 'auto'};
            {borderRadiusStyle}"
          role="button"
          tabindex="0"
          onmousedown={(e) =>
            onTileMouseDownFromParent &&
            onTileMouseDownFromParent(placement, bed.id, e)}
        >
          <PlantPlacementTile
            plantPlacement={placement}
            width={tileLayout.width}
            height={tileLayout.height}
            tileX={placement.x}
            tileY={placement.y}
            gridSize={bed.width}
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- SVG Frame Border (top layer) -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 {svgWidth} {svgHeight}"
    width={svgWidth}
    height={svgHeight}
    style="position: absolute; left: 0; top: 0; z-index: 3; pointer-events: none;"
  >
    <rect
      x={frameX}
      y={frameY}
      width={frameWidth}
      height={frameHeight}
      class="raised-bed__frame"
      rx="10"
      ry="10"
    />
  </svg>
</div>

<!-- DEBUG: Show edgeBorders length -->
<p>edgeBorders: {edgeBorders.length}</p>

<style lang="scss">
  .tile-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    /* pointer-events: none; // allow SVG events through except for tiles */
  }
  .tile-overlay__tile {
    position: absolute;
    pointer-events: auto;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    box-shadow: 0 2px 6px #0002;
    cursor: grab;
    user-select: none;
    font-size: 14px;
    font-weight: bold;
    color: #222;
    border: 2px solid rgb(0, 0, 0, 0.4);
    transition: box-shadow 0.1s;
    box-sizing: border-box;
  }
  .raised-bed {
    position: relative;
    &__plantable-area {
      fill: #90683d;
      opacity: 0.4;
      // stroke: red;
      // stroke-width: 2 ;
    }
    &__frame {
      fill: none;
      stroke: rgb(var(--color-soil-brown));
      stroke-width: 4;
      stroke-linejoin: round;
    }
    &__grid-line {
      stroke: #4b4e6d;
      stroke-width: 0.5;
      opacity: 0.3;
      stroke-dasharray: 2, 2;
    }
    &__title {
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 1rem;
      font-weight: bold;
      color: #5a3e36;
      margin-bottom: 0.25em;
      margin-top: 0.5em;
    }
    &__meters-row {
      display: flex;
      flex-direction: row;
      gap: 48px;
      justify-content: center;
      align-items: center;
      margin-bottom: 1em;
      margin-top: 0;
    }
  }
  .tile-overlay__tiles {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .tile-overlay__highlight {
    position: absolute;
    z-index: 9999;
    border: 6px solid #ffff00;
    background: rgba(255, 255, 0, 0.25);
    pointer-events: none;
    border-radius: 0;
    box-sizing: border-box;
  }
  .tile-overlay__highlight--invalid {
    border: 6px solid #ff2222 !important;
    background: rgba(255, 0, 0, 0.25) !important;
  }
  .tile-overlay__highlight--source {
    border-color: #3498db !important;
    background: rgba(52, 152, 219, 0.15) !important;
  }
  .tile-overlay__highlight--target {
    border-color: #ffff00 !important;
    background: rgba(255, 255, 0, 0.25) !important;
  }
</style>
