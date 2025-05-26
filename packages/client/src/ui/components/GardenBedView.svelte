<script lang="ts">
import type { GardenBed } from '../../lib/garden-bed'
import {
	type Border,
	GardenBedLayoutCalculator,
	calculateEdgeBorders,
} from '../../lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'
import type { PlantPlacement } from '../../lib/plant-placement'
import { dragState, isDragStatePopulated } from '../state/dragState'
import HorizontalBarMeter from './HorizontalBarMeter.svelte'
import PlantPlacementTile from './PlantPlacementTile.svelte'

interface GardenBedViewProps {
	bed: GardenBed
	onTileMouseDownFromParent?: (
		plant: PlantPlacement,
		bedId: string,
		event: MouseEvent,
	) => void
	edgeIndicators?: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
}

const {
	bed,
	onTileMouseDownFromParent,
	edgeIndicators = [],
}: GardenBedViewProps = $props()
// Instantiate the layout calculator
const layout = new GardenBedLayoutCalculator({
	width: bed.width,
	height: bed.height,
	...DEFAULT_LAYOUT_PARAMS, // Use shared constants
})

// Use layout for all layout-related values
const svgWidth = layout.svgWidth
const svgHeight = layout.svgHeight
const frameX = layout.frameX
const frameY = layout.frameY
const frameWidth = layout.frameWidth
const frameHeight = layout.frameHeight
const interiorX = layout.interiorX
const interiorY = layout.interiorY
const interiorWidth = layout.interiorWidth
const interiorHeight = layout.interiorHeight
const cellWidth = layout.cellWidth
const cellHeight = layout.cellHeight

// Grid lines
const verticalLines = layout.getVerticalLines()
const horizontalLines = layout.getHorizontalLines()

// Function to convert garden coordinates (0,0 at bottom-left) to SVG coordinates
const gardenToSvgX = (gardenX: number) => layout.gardenToSvgX(gardenX)
const gardenToSvgY = (gardenY: number) => layout.gardenToSvgY(gardenY)

// Use the factored-out isValidPlacement
function isValidPlacement(x: number, y: number, size: number): boolean {
	return layout.isValidPlacement(
		x,
		y,
		size,
		bed.plantPlacements,
		$dragState.draggedPlant?.id,
	)
}

// Use the factored-out calculateEdgeBorders
let edgeBorders = $state<Border[]>([])
$effect(() => {
	const newBorders = calculateEdgeBorders(bed, edgeIndicators, layout)
	if (
		newBorders.length !== edgeBorders.length ||
		newBorders.some((b, i) => JSON.stringify(b) !== JSON.stringify(edgeBorders[i]))
	) {
		edgeBorders = newBorders
	}
})
// DEBUG: Log edgeIndicators and plant IDs in this bed
bed.plantPlacements.forEach((p) => p.id)

interface TileStyleProps {
	left: string
	top: string
	width: string
	height: string
	zIndex: number
	opacity: number
	pointerEvents: 'none' | 'auto'
}

function getTileComputedStyles(
	placementId: string,
	currentDragState: typeof $dragState,
	overlayLayout: ReturnType<typeof layout.getTileOverlayLayoutInfo>,
): TileStyleProps {
	const isBeingDragged =
		currentDragState.draggedPlant && currentDragState.draggedPlant.id === placementId

	// Since dragOffset is not used and tiles don't visually follow mouse,
	// left/top are always based on overlayLayout.
	const left = `${overlayLayout.svgX}px`
	const top = `${overlayLayout.svgY}px`

	return {
		left,
		top,
		width: `${overlayLayout.width}px`,
		height: `${overlayLayout.height}px`,
		zIndex: isBeingDragged ? 100 : 2,
		opacity: isBeingDragged ? 0.7 : 1,
		pointerEvents:
			currentDragState.draggedPlant && currentDragState.draggedPlant.id !== placementId
				? 'none'
				: 'auto',
	}
}
</script>

<!-- Title and meters OUTSIDE the .raised-bed box -->
<div class="raised-bed__title">
	Raised Garden Bed ({bed.width}×{bed.height} feet)
</div>
<div class="raised-bed__meters-row">
	<HorizontalBarMeter
		id={`${bed.id}-water`}
		value={bed.waterLevel}
		max={5}
		filledColor="#3498db"
		emptyColor="#3498db22"
		borderColor="#3498db"
		label="Water"
		labelColor="#3498db" />
	<HorizontalBarMeter
		id={`${bed.id}-sun`}
		value={bed.sunLevel}
		max={5}
		filledColor="#FFD600"
		emptyColor="#FFD60022"
		borderColor="#FFD600"
		label="Sun"
		labelColor="#FF6666" />
</div>

<!-- The actual bed, grid, overlays, and frame -->
<div
	class="raised-bed"
	data-bed-id={bed.id}
	style="width: {svgWidth}px; height: {svgHeight}px;">
	<!-- SVG Plantable Area and Grid (background) -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 {svgWidth} {svgHeight}"
		width={svgWidth}
		height={svgHeight}
		style="position: absolute; left: 0; top: 0; z-index: 1;">
		<rect
			x={interiorX}
			y={interiorY}
			width={interiorWidth}
			height={interiorHeight}
			class="raised-bed__plantable-area"
			opacity="0.2" />
		<!-- Grid lines -->
		{#each verticalLines as line (line.key)}
			<line
				x1={line.points[0].x}
				y1={line.points[0].y}
				x2={line.points[1].x}
				y2={line.points[1].y}
				class="raised-bed__grid-line" />
		{/each}
		{#each horizontalLines as line (line.key)}
			<line
				x1={line.points[0].x}
				y1={line.points[0].y}
				x2={line.points[1].x}
				y2={line.points[1].y}
				class="raised-bed__grid-line" />
		{/each}
		<!-- Edge Indicator Lines -->
		{#each edgeBorders as border (border.key)}
			<line
				x1={border.points[0].x}
				y1={border.points[0].y}
				x2={border.points[1].x}
				y2={border.points[1].y}
				stroke={border.color}
				stroke-width={layout.frameThickness}
				stroke-linecap="round"
				opacity="0.95" />
		{/each}
		{#if bed.width <= 8 && bed.height <= 8}
			<g id="raised-bed__coordinate-labels" opacity="0.6">
				{#each Array.from({ length: bed.width }, (_, i) => i) as x (`${bed.id}-${x}`)}
					<text
						x={gardenToSvgX(x) + cellWidth / 2}
						y={svgHeight - 5}
						text-anchor="middle"
						font-family="Arial, sans-serif"
						font-size="10"
						class="slate-label-gray">
						{x}
					</text>
				{/each}
				{#each Array.from({ length: bed.height }, (_, i) => i) as y (`${bed.id}-${y}`)}
					<text
						x="5"
						y={gardenToSvgY(y) + cellHeight / 2 + 3}
						text-anchor="middle"
						font-family="Arial, sans-serif"
						font-size="10"
						class="slate-label-gray">
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
			style="width: {svgWidth}px; height: {svgHeight}px; position: relative;">
			{#if $dragState.targetBedId === bed.id && $dragState.highlightedCell && $dragState.draggedPlant}
				{@const size = isDragStatePopulated($dragState) ? $dragState.draggedTileSize : 1}
				{@const tileLayout = layout.getTileLayoutInfo({
					x: $dragState.highlightedCell.x,
					y: $dragState.highlightedCell.y,
					size,
				})}
				{@const valid = isValidPlacement(
					$dragState.highlightedCell.x,
					$dragState.highlightedCell.y,
					size,
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
          ">
				</div>
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

				{@const corners = layout.getTileFrameCornerPositions({
					x: placement.x,
					y: placement.y,
					size,
					bedWidth: bed.width,
					bedHeight: bed.height,
				})}
				{@const borderRadiusStyle = corners
					.map((corner) => `border-${corner}-radius: 8px;`)
					.join(' ')}
				{@const computedStyles = getTileComputedStyles(
					placement.id,
					$dragState,
					overlayLayout,
				)}
				<div
					class="tile-overlay__tile"
					style="left: {computedStyles.left}; top: {computedStyles.top}; width: {computedStyles.width}; height: {computedStyles.height}; z-index: {computedStyles.zIndex}; opacity: {computedStyles.opacity}; pointer-events: {computedStyles.pointerEvents}; {borderRadiusStyle}"
					role="button"
					tabindex="0"
					onmousedown={(e) => {
						if (onTileMouseDownFromParent) onTileMouseDownFromParent(placement, bed.id, e)
					}}>
					<PlantPlacementTile plantPlacement={placement} sizePx={tileLayout.width} />
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
		style="position: absolute; left: 0; top: 0; z-index: 3; pointer-events: none;">
		<rect
			x={frameX}
			y={frameY}
			width={frameWidth}
			height={frameHeight}
			class="raised-bed__frame"
			rx="10"
			ry="10" />
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
