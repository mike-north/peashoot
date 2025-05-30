<script lang="ts">
import type { GardenBed } from '../../private-lib/garden-bed'
import { GardenBedLayoutCalculator } from '../../private-lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../private-lib/grid-layout-constants'
import { disablePointerEventsWhenDragging } from '../../private-lib/actions/disablePointerEventsWhenDragging'
import { dragState } from '../state/dragState'

interface Props {
	bed: GardenBed
	edgeBorders: {
		key: string
		points: { x: number; y: number }[]
		color: string
	}[]
}

const { bed, edgeBorders }: Props = $props()

// Instantiate the layout calculator
const layout = new GardenBedLayoutCalculator({
	width: bed.width,
	height: bed.height,
	...DEFAULT_LAYOUT_PARAMS,
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

// Function to convert garden coordinates to SVG coordinates
const gardenToSvgX = (gardenX: number) => layout.gardenToSvgX(gardenX)
const gardenToSvgY = (gardenY: number) => layout.gardenToSvgY(gardenY)
</script>

<style>
.grid-background {
	fill: #90683d;
	opacity: 0.4;
}

.grid-line {
	stroke: #4b4e6d;
	stroke-width: 0.5;
	opacity: 0.3;
	stroke-dasharray: 2, 2;
}

.coordinate-label {
	font-family: Arial, sans-serif;
	font-size: 10px;
	opacity: 0.6;
	fill: #64748b;
}

.frame-border {
	fill: none;
	stroke: var(--color-soil-brown);
	stroke-width: 4;
	stroke-linejoin: round;
}
</style>

<!-- Background SVG with plantable area and grid -->
<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 {svgWidth} {svgHeight}"
	width={svgWidth}
	height={svgHeight}
	style="position: absolute; left: 0; top: 0; z-index: 1;"
	use:disablePointerEventsWhenDragging={$dragState}
>
	<rect
		x={interiorX}
		y={interiorY}
		width={interiorWidth}
		height={interiorHeight}
		class="grid-background"
		opacity="0.2"
	/>

	<!-- Grid lines -->
	{#each verticalLines as line (line.key)}
		<line
			x1={line.points[0].x}
			y1={line.points[0].y}
			x2={line.points[1].x}
			y2={line.points[1].y}
			class="grid-line"
		/>
	{/each}
	{#each horizontalLines as line (line.key)}
		<line
			x1={line.points[0].x}
			y1={line.points[0].y}
			x2={line.points[1].x}
			y2={line.points[1].y}
			class="grid-line"
		/>
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
			opacity="0.95"
		/>
	{/each}

	<!-- Coordinate labels (only for small beds) -->
	{#if bed.width <= 8 && bed.height <= 8}
		<g id="coordinate-labels" opacity="0.6">
			{#each Array.from({ length: bed.width }, (_, i) => i) as x (`${bed.id}-x-${x}`)}
				<text
					x={gardenToSvgX(x) + cellWidth / 2}
					y={svgHeight - 5}
					text-anchor="middle"
					class="coordinate-label"
				>
					{x}
				</text>
			{/each}
			{#each Array.from({ length: bed.height }, (_, i) => i) as y (`${bed.id}-y-${y}`)}
				<text
					x="5"
					y={gardenToSvgY(y) + cellHeight / 2 + 3}
					text-anchor="middle"
					class="coordinate-label"
				>
					{y}
				</text>
			{/each}
		</g>
	{/if}
</svg>

<!-- Frame Border (top layer) -->
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
		class="frame-border"
		rx="10"
		ry="10"
	/>
</svg>
