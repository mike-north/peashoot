<script lang="ts">
import GridPlacementTile from '../../private/grid/ui/GridPlacementTile.svelte'
import PendingOperationTile from '../../private/grid/ui/PendingOperationTile.svelte'
import {
	GardenBedLayoutCalculator,
	calculateEdgeBorders,
	type Border,
} from '../garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../private/grid/grid-layout-constants'

import GenericDropZone from '../../private/dnd/components/GenericDropZone.svelte'
import GenericDraggable from '../../private/dnd/components/GenericDraggable.svelte'
import {
	pendingOperations as genericPendingOperations,
	isDragStatePopulated,
	dragState as genericDragState,
	isDraggingNewItem,
	isDraggingExistingItem,
} from '../../private/dnd/state'
import type { DraggableItem, PendingOperation } from '../../private/dnd/types'
import { disablePointerEventsWhenDragging } from '../../private/grid/actions/disablePointerEventsWhenDragging'
import type { Component } from 'svelte'

import type { GridPlaceable } from '../../private/grid/grid-placement'
import { isGridPlaceable } from '../../private/grid/grid-placement'
import type { GridArea } from '../../private/grid/grid-area'
import {
	isGridPendingOperation,
	type GridPendingOperation,
} from '../grid/grid-drag-state'

// Define a type for the operation that should cause pulsing
type PulsingSourceOperation = GridPendingOperation<GridPlaceable> & {
	type: 'placement' | 'removal'
	originalSourceZoneId: string
	originalInstanceId: string
}

// Type guard function
function isPulsingSourceOperation(
	op: PendingOperation<DraggableItem>,
	currentBedId: string,
): op is PulsingSourceOperation {
	return (
		(op.type === 'placement' || op.type === 'removal') &&
		op.state === 'pending' &&
		op.originalSourceZoneId === currentBedId &&
		typeof op.originalInstanceId === 'string' &&
		op.originalInstanceId.length > 0
	)
}

interface GardenBedViewProps {
	grid: GridArea<GridPlaceable>
	items: GridPlaceable[]
	TooltipComponent: Component<{ item: GridPlaceable }>
	edgeIndicators?: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
	tileSizeForItem: (item: GridPlaceable) => number
}

const {
	grid,
	TooltipComponent,
	items,
	edgeIndicators = [],
	tileSizeForItem,
}: GardenBedViewProps = $props()

// plantPlacements is already GridPlacement<PlantWithSize>[]
const gridPlacements = $derived(grid.placements)

// Identify plant placements in this bed that are the source of a pending move or clone
let pendingSourcePlantIds = $derived(
	$genericPendingOperations
		.filter((op): op is PulsingSourceOperation => isPulsingSourceOperation(op, grid.id))
		.map((op) => op.originalInstanceId),
)

// Instantiate the layout calculator
const layout = new GardenBedLayoutCalculator({
	width: grid.width,
	height: grid.height,
	tileSizeForItem,
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
	// For existing plants, exclude the dragged plant from collision detection
	const skipId = $genericDragState.draggedExistingItem?.id

	// Use gridPlacements instead of bed.plantPlacements
	return layout.isValidPlacement(items, x, y, size, gridPlacements, skipId)
}

let edgeBorders = $state<Border[]>([])
$effect(() => {
	// Convert gridPlacements to expected format for calculateEdgeBorders
	const bedWithSizes = {
		...grid,
		plantPlacements: gridPlacements.map((placement) => ({
			x: placement.x,
			y: placement.y,
			id: placement.id,
			plantTile: {
				size: placement.size,
			},
		})),
	}
	const newBorders = calculateEdgeBorders(bedWithSizes, edgeIndicators, layout)
	if (
		newBorders.length !== edgeBorders.length ||
		newBorders.some((b, i) => JSON.stringify(b) !== JSON.stringify(edgeBorders[i]))
	) {
		edgeBorders = newBorders
	}
})

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
	overlayLayout: ReturnType<typeof layout.getTileOverlayLayoutInfo>,
): TileStyleProps {
	const currentDragStateValue = $genericDragState
	const isBeingDragged =
		currentDragStateValue.draggedExistingItem &&
		currentDragStateValue.draggedExistingItem.id === placementId

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
			currentDragStateValue.draggedExistingItem &&
			currentDragStateValue.draggedExistingItem.id !== placementId
				? 'none'
				: 'auto',
	}
}

interface DropEventPayload {
	item: DraggableItem
	sourceZoneId: string | null
	targetZoneId: string
	x?: number
	y?: number
	isClone: boolean
}

function handleDropProp(payload: DropEventPayload) {
	if (
		payload.targetZoneId !== grid.id ||
		payload.x === undefined ||
		payload.y === undefined
	) {
		console.warn(
			'[GardenBedView] Drop event not for this bed or missing/invalid coordinates.',
		)
		return
	}
	const { item, x, y } = payload
	const itemSize = (item as GridPlaceable).presentation.size

	// Perform local placement validation (e.g., collision, bounds).
	// This is a preliminary check. The full async validation will be done by GardenView.
	if (!isValidPlacement(x, y, itemSize)) {
		console.warn(
			'[GardenBedView] Local validation failed: Invalid placement, drop rejected.',
		)
		// Optionally, update dragState here to indicate an invalid drop attempt to GenericDropZone/DragManager
		// For now, just returning will prevent further processing in this component.
		return
	}
}

// Derive the actual size of the item being dragged for grid purposes
const draggedGridItemEffectiveSize = $derived(
	(() => {
		const currentDragState = $genericDragState
		if (isDraggingNewItem(currentDragState)) {
			if (isGridPlaceable(currentDragState.draggedNewItem)) {
				return currentDragState.draggedNewItem.presentation.size
			}
		} else if (isDraggingExistingItem(currentDragState)) {
			if (isGridPlaceable(currentDragState.draggedExistingItem.item)) {
				return currentDragState.draggedExistingItem.item.presentation.size
			}
		}
		return 1 // Default if not GridPlaceable or not determinable
	})(),
)
</script>

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

	&--pending {
		cursor: default;
		pointer-events: none;
		border: 2px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
}

.figure-container {
	overflow-x: scroll;
	background-color: var(--color-neutral-200);
	width: 100%;
	height: 250px;
	display: block;
	padding: 2em;
}
.raised-bed-diagram {
	position: relative;
	&__plantable-area {
		fill: #90683d;
		opacity: 0.4;
		// stroke: red;
		// stroke-width: 2 ;
	}
	&__frame {
		fill: none;
		stroke: var(--color-soil-brown);
		stroke-width: 4;
		stroke-linejoin: round;
	}
	&__grid-line {
		stroke: #4b4e6d;
		stroke-width: 0.5;
		opacity: 0.3;
		stroke-dasharray: 2, 2;
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

<div class="figure-container">
	<figure
		class="raised-bed-diagram"
		data-bed-id={grid.id}
		style="width: {svgWidth}px; height: {svgHeight}px;"
	>
		<!-- SVG Plantable Area and Grid (background) -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 {svgWidth} {svgHeight}"
			width={svgWidth}
			height={svgHeight}
			style="position: absolute; left: 0; top: 0; z-index: 1;"
			use:disablePointerEventsWhenDragging={$genericDragState}
		>
			<rect
				x={interiorX}
				y={interiorY}
				width={interiorWidth}
				height={interiorHeight}
				class="raised-bed-diagram__plantable-area"
				opacity="0.2"
			/>
			<!-- Grid lines -->
			{#each verticalLines as line (line.key)}
				<line
					x1={line.points[0].x}
					y1={line.points[0].y}
					x2={line.points[1].x}
					y2={line.points[1].y}
					class="raised-bed-diagram__grid-line"
				/>
			{/each}
			{#each horizontalLines as line (line.key)}
				<line
					x1={line.points[0].x}
					y1={line.points[0].y}
					x2={line.points[1].x}
					y2={line.points[1].y}
					class="raised-bed-diagram__grid-line"
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
			<!-- Coordinate Labels -->
			<g id="raised-bed-diagram__coordinate-labels" opacity="0.6">
				<!-- X-axis labels (below) -->
				{#if grid.width <= 16}
					<!-- Show all labels for beds up to 16 wide -->
					{#each Array.from({ length: grid.width }, (_, i) => i) as x (`${grid.id}-x-${x}`)}
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
				{:else}
					<!-- For very wide beds, show labels every 5 cells -->
					{#each Array.from({ length: grid.width }, (_, i) => i).filter((x) => x % 5 === 0 || x === grid.width - 1) as x (`${grid.id}-x-${x}`)}
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
				{/if}

				<!-- Y-axis labels (left) -->
				{#if grid.height <= 16}
					<!-- Show all labels for beds up to 16 tall -->
					{#each Array.from({ length: grid.height }, (_, i) => i) as y (`${grid.id}-y-${y}`)}
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
				{:else}
					<!-- For very tall beds, show labels every 5 cells -->
					{#each Array.from({ length: grid.height }, (_, i) => i).filter((y) => y % 5 === 0 || y === grid.height - 1) as y (`${grid.id}-y-${y}`)}
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
				{/if}
			</g>
		</svg>

		<!-- HTML Plant Tiles (middle layer) -->
		<div class="tile-overlay" style="width: {svgWidth}px; height: {svgHeight}px;">
			<GenericDropZone zoneId={grid.id} onDrop={handleDropProp}>
				<div
					class="tile-overlay__tiles"
					style="width: {svgWidth}px; height: {svgHeight}px; position: relative;"
					use:disablePointerEventsWhenDragging={$genericDragState}
				>
					{#if $genericDragState.targetZoneId === grid.id && $genericDragState.highlightedCell && isDragStatePopulated($genericDragState)}
						{@const effectiveItemSize = draggedGridItemEffectiveSize}
						{@const tileLayout = layout.getTileLayoutInfo({
							x: $genericDragState.highlightedCell.x,
							y: $genericDragState.highlightedCell.y,
							size: effectiveItemSize,
						})}
						{@const valid = isValidPlacement(
							$genericDragState.highlightedCell.x,
							$genericDragState.highlightedCell.y,
							effectiveItemSize,
						)}
						{@const isSource = $genericDragState.sourceZoneId === grid.id}
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
					{#each gridPlacements as placement (placement.id)}
						{@const itemDataSize = placement.size}
						{@const tileLayout = layout.getTileLayoutInfo({
							x: placement.x,
							y: placement.y,
							size: itemDataSize,
						})}
						{@const overlayLayout = layout.getTileOverlayLayoutInfo({
							x: placement.x,
							y: placement.y,
							size: itemDataSize,
							strokeWidth: 2,
						})}

						{@const corners = layout.getTileFrameCornerPositions({
							x: placement.x,
							y: placement.y,
							size: itemDataSize,
							bedWidth: grid.width,
							bedHeight: grid.height,
						})}
						{@const borderRadiusStyle = corners
							.map((corner) => `border-${corner}-radius: 8px;`)
							.join(' ')}
						{@const computedStyles = getTileComputedStyles(placement.id, overlayLayout)}
						{@const isPendingSource = pendingSourcePlantIds.includes(placement.id)}
						<GenericDraggable
							item={placement.item}
							existingItemInstance={placement}
							sourceZoneId={grid.id}
						>
							<div
								class="tile-overlay__tile"
								style="left: {computedStyles.left}; top: {computedStyles.top}; width: {computedStyles.width}; height: {computedStyles.height}; z-index: {computedStyles.zIndex}; opacity: {computedStyles.opacity}; pointer-events: {computedStyles.pointerEvents}; {borderRadiusStyle}"
							>
								<GridPlacementTile
									TooltipComponent={TooltipComponent}
									placement={placement}
									sizePx={tileLayout.width}
									isPulsingSource={isPendingSource}
								/>
							</div>
						</GenericDraggable>
					{/each}

					<!-- Pending Operations -->
					{#each $genericPendingOperations.filter( (op) => isGridPendingOperation(op, isGridPlaceable), ) as operation (operation.id)}
						{@const itemOpSize = operation.item.presentation.size}
						{@const tileLayout = layout.getTileLayoutInfo({
							x: operation.x || 0,
							y: operation.y || 0,
							size: itemOpSize,
						})}
						{@const overlayLayout = layout.getTileOverlayLayoutInfo({
							x: operation.x || 0,
							y: operation.y || 0,
							size: itemOpSize,
							strokeWidth: 2,
						})}
						{@const corners = layout.getTileFrameCornerPositions({
							x: operation.x || 0,
							y: operation.y || 0,
							size: itemOpSize,
							bedWidth: grid.width,
							bedHeight: grid.height,
						})}
						{@const borderRadiusStyle = corners
							.map((corner) => `border-${corner}-radius: 8px;`)
							.join(' ')}
						<div
							class="tile-overlay__tile tile-overlay__tile--pending"
							style="left: {overlayLayout.svgX}px; top: {overlayLayout.svgY}px; width: {overlayLayout.width}px; height: {overlayLayout.height}px; z-index: 5; {borderRadiusStyle}"
						>
							<PendingOperationTile operation={operation} sizePx={tileLayout.width} />
						</div>
					{/each}
				</div>
			</GenericDropZone>
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
				class="raised-bed-diagram__frame"
				rx="10"
				ry="10"
			/>
		</svg>
	</figure>
</div>
