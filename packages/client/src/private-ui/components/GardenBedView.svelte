<script lang="ts">
import PlantPlacementTile from './PlantPlacementTile.svelte'
import PendingOperationTile from './PendingOperationTile.svelte'
import HorizontalBarMeter from './HorizontalBarMeter.svelte'
import {
	GardenBedLayoutCalculator,
	calculateEdgeBorders,
	type Border,
} from '../../private-lib/garden-bed-layout-calculator'
import type { GardenBed } from '../../private-lib/garden-bed'
import { DEFAULT_LAYOUT_PARAMS } from '../../private-lib/layout-constants'

import GenericDropZone from '../../private-lib/dnd/components/GenericDropZone.svelte'
import GenericDraggable from '../../private-lib/dnd/components/GenericDraggable.svelte'
import {
	pendingOperations as genericPendingOperations,
	isDragStatePopulated,
	dragState as genericDragState,
} from '../../private-lib/dnd/state'
import type { DraggableItem } from '../../private-lib/dnd/types'
import {
	plantPlacementToExistingGardenItem,
	type GardenPendingOperation,
	getPlantSize,
} from '../state/gardenDragState'
import { disablePointerEventsWhenDragging } from '../../private-lib/actions/disablePointerEventsWhenDragging'
import type { Plant } from '../../private-lib/plant'

// Define a type for the operation that should cause pulsing
type PulsingSourceOperation = GardenPendingOperation & {
	type: 'placement' | 'removal'
	originalSourceZoneId: string
	originalInstanceId: string
}

// Type guard function
function isPulsingSourceOperation(
	op: GardenPendingOperation,
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
	bed: GardenBed
	plants: Plant[]
	edgeIndicators?: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
	colSpan?: number
	[k: string]: unknown
}

const {
	bed,
	plants,
	edgeIndicators = [],
	colSpan = 1,
	...rest
}: GardenBedViewProps = $props()

// Map colSpan number to Tailwind class
const colSpanClass = $derived(
	(() => {
		switch (colSpan) {
			case 1:
				return 'col-span-1'
			case 2:
				return 'col-span-2'
			case 3:
				return 'col-span-3'
			case 4:
				return 'col-span-4'
			case 5:
				return 'col-span-5'
			default:
				return 'col-span-1'
		}
	})(),
)

// Identify plant placements in this bed that are the source of a pending move or clone
let pendingSourcePlantIds = $derived(
	($genericPendingOperations as GardenPendingOperation[])
		.filter((op): op is PulsingSourceOperation => isPulsingSourceOperation(op, bed.id))
		.map((op) => op.originalInstanceId), // No need for '!' due to type guard
)

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
	// For existing plants, exclude the dragged plant from collision detection
	const skipId = $genericDragState.draggedExistingItem?.id

	return layout.isValidPlacement(plants, x, y, size, bed.plantPlacements, skipId)
}

let edgeBorders = $state<Border[]>([])
$effect(() => {
	// Convert GardenBed to expected format for calculateEdgeBorders
	const bedWithSizes = {
		...bed,
		plantPlacements: bed.plantPlacements.map((placement) => {
			const plant = plants.find((p) => p.id === placement.plantId)
			return {
				x: placement.x,
				y: placement.y,
				id: placement.id,
				plantTile: {
					size: plant ? getPlantSize(plant) : 1,
				},
			}
		}),
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
		payload.targetZoneId !== bed.id ||
		payload.x === undefined ||
		payload.y === undefined
	) {
		console.warn(
			'[GardenBedView] Drop event not for this bed or missing/invalid coordinates.',
		)
		return
	}
	const { item, x, y } = payload
	const itemSize = getPlantSize(item as Plant)

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

.raised-bed {
	.figure-container {
		overflow-x: scroll;
		background-color: var(--color-neutral-200);
		width: 100%;
		height: 250px;
		display: block;
		padding: 2em;
	}
}

.raised-bed__diagram {
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

<div class="raised-bed card bg-base-100 shadow-sm {colSpanClass} {rest.class || ''}">
	<div class="figure-container">
		<figure
			class="raised-bed__diagram"
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
				use:disablePointerEventsWhenDragging={$genericDragState}
			>
				<rect
					x={interiorX}
					y={interiorY}
					width={interiorWidth}
					height={interiorHeight}
					class="raised-bed__diagram__plantable-area"
					opacity="0.2"
				/>
				<!-- Grid lines -->
				{#each verticalLines as line (line.key)}
					<line
						x1={line.points[0].x}
						y1={line.points[0].y}
						x2={line.points[1].x}
						y2={line.points[1].y}
						class="raised-bed__diagram__grid-line"
					/>
				{/each}
				{#each horizontalLines as line (line.key)}
					<line
						x1={line.points[0].x}
						y1={line.points[0].y}
						x2={line.points[1].x}
						y2={line.points[1].y}
						class="raised-bed__diagram__grid-line"
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
				<g id="raised-bed__diagram__coordinate-labels" opacity="0.6">
					<!-- X-axis labels (below) -->
					{#if bed.width <= 16}
						<!-- Show all labels for beds up to 16 wide -->
						{#each Array.from({ length: bed.width }, (_, i) => i) as x (`${bed.id}-x-${x}`)}
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
						{#each Array.from({ length: bed.width }, (_, i) => i).filter((x) => x % 5 === 0 || x === bed.width - 1) as x (`${bed.id}-x-${x}`)}
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
					{#if bed.height <= 16}
						<!-- Show all labels for beds up to 16 tall -->
						{#each Array.from({ length: bed.height }, (_, i) => i) as y (`${bed.id}-y-${y}`)}
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
						{#each Array.from({ length: bed.height }, (_, i) => i).filter((y) => y % 5 === 0 || y === bed.height - 1) as y (`${bed.id}-y-${y}`)}
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
				<GenericDropZone zoneId={bed.id} onDrop={handleDropProp}>
					<div
						class="tile-overlay__tiles"
						style="width: {svgWidth}px; height: {svgHeight}px; position: relative;"
						use:disablePointerEventsWhenDragging={$genericDragState}
					>
						{#if $genericDragState.targetZoneId === bed.id && $genericDragState.highlightedCell && isDragStatePopulated($genericDragState)}
							{@const draggedItemData =
								$genericDragState.draggedNewItem ??
								$genericDragState.draggedExistingItem?.itemData}
							{@const itemSize = draggedItemData
								? getPlantSize(draggedItemData as Plant)
								: 1}
							{@const tileLayout = layout.getTileLayoutInfo({
								x: $genericDragState.highlightedCell.x,
								y: $genericDragState.highlightedCell.y,
								size: itemSize,
							})}
							{@const valid = isValidPlacement(
								$genericDragState.highlightedCell.x,
								$genericDragState.highlightedCell.y,
								itemSize,
							)}
							{@const isSource = $genericDragState.sourceZoneId === bed.id}
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
							{@const plant = plants.find((p) => p.id === placement.plantId)}
							{#if plant}
								{@const existingGardenItem = plantPlacementToExistingGardenItem(
									placement,
									plant,
								)}
								{@const itemDataSize = getPlantSize(existingGardenItem.itemData)}
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
									bedWidth: bed.width,
									bedHeight: bed.height,
								})}
								{@const borderRadiusStyle = corners
									.map((corner) => `border-${corner}-radius: 8px;`)
									.join(' ')}
								{@const computedStyles = getTileComputedStyles(
									placement.id,
									overlayLayout,
								)}
								{@const isPendingSource = pendingSourcePlantIds.includes(placement.id)}
								<GenericDraggable
									itemData={existingGardenItem.itemData}
									existingItemInstance={existingGardenItem}
									sourceZoneId={bed.id}
								>
									<div
										class="tile-overlay__tile"
										style="left: {computedStyles.left}; top: {computedStyles.top}; width: {computedStyles.width}; height: {computedStyles.height}; z-index: {computedStyles.zIndex}; opacity: {computedStyles.opacity}; pointer-events: {computedStyles.pointerEvents}; {borderRadiusStyle}"
									>
										<PlantPlacementTile
											plantPlacement={existingGardenItem}
											sizePx={tileLayout.width}
											isSourceOfPendingMoveOrClone={isPendingSource}
										/>
									</div>
								</GenericDraggable>
							{:else}
								{@const overlayLayout = layout.getTileOverlayLayoutInfo({
									x: placement.x,
									y: placement.y,
									size: 1,
									strokeWidth: 2,
								})}
								<div
									class="tile-overlay__tile"
									style="left: {overlayLayout.svgX}px; top: {overlayLayout.svgY}px; width: {overlayLayout.width}px; height: {overlayLayout.height}px; z-index: 2; background: #ff0000; opacity: 0.5; border: 2px solid #000;"
									title="Missing plant data for ID: {placement.plantId}"
								>
									<div
										style="color: white; text-align: center; font-size: 8px; padding: 2px;"
									>
										Missing Plant
										<br />
										ID: {placement.plantId}
									</div>
								</div>
							{/if}
						{/each}

						<!-- Pending Operations -->
						{#each $genericPendingOperations.filter((op) => op.zoneId === bed.id) as operation (operation.id)}
							{@const itemOpSize = getPlantSize(operation.item as Plant)}
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
								bedWidth: bed.width,
								bedHeight: bed.height,
							})}
							{@const borderRadiusStyle = corners
								.map((corner) => `border-${corner}-radius: 8px;`)
								.join(' ')}
							<div
								class="tile-overlay__tile tile-overlay__tile--pending"
								style="left: {overlayLayout.svgX}px; top: {overlayLayout.svgY}px; width: {overlayLayout.width}px; height: {overlayLayout.height}px; z-index: 5; {borderRadiusStyle}"
							>
								<PendingOperationTile
									operation={operation as GardenPendingOperation}
									sizePx={tileLayout.width}
								/>
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
					class="raised-bed__diagram__frame"
					rx="10"
					ry="10"
				/>
			</svg>
		</figure>
	</div>
	<div class="card-body">
		<div class="card-title">
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
				labelColor="#3498db"
			/>
			<HorizontalBarMeter
				id={`${bed.id}-sun`}
				value={bed.sunLevel}
				max={5}
				filledColor="#FFD600"
				emptyColor="#FFD60022"
				borderColor="#FFD600"
				label="Sun"
				labelColor="#FF6666"
			/>
		</div>
	</div>
</div>
