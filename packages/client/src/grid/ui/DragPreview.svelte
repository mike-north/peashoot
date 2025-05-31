<script lang="ts">
import GridPlacementTile from './GridPlacementTile.svelte'
import type { GridPlacement } from '../grid-placement'
import type { Plant } from '../../private-lib/plant'
import { dragState as genericDragState } from '../../dnd/state'
import {
	isDragStatePopulated,
	getDraggedItemInfo,
	isDraggingExistingItem,
	isDraggingNewItem,
} from '../../dnd/state'
import type { GardenDragState } from '../../private-ui/state/gardenDragState'
import { existingGridItemToGridPlacement } from '../../private-ui/state/gardenDragState'
import type { GardenBed } from '../../private-lib/garden-bed'
import { GardenBedLayoutCalculator } from '../../private-lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../private-lib/grid-layout-constants'
import { isPlant } from '../../private-lib/plant'

interface Props {
	beds: GardenBed[]
}

const { beds }: Props = $props()

type PlantWithSize = Plant & { size: number }

let currentDragState = $derived($genericDragState as GardenDragState<PlantWithSize>)
let draggedInfo = $derived(
	isDragStatePopulated(currentDragState) ? getDraggedItemInfo(currentDragState) : null,
)

let previewPosition = $derived.by(() => {
	if (!draggedInfo) return null

	const effectiveSize = draggedInfo.effectiveSize
	const cellSize = DEFAULT_LAYOUT_PARAMS.cellSize
	const previewSize = cellSize * effectiveSize

	const shouldAlignToGrid =
		currentDragState.targetZoneId && currentDragState.highlightedCell

	if (!shouldAlignToGrid) {
		return {
			x: currentDragState.dragPosition.x - previewSize / 2,
			y: currentDragState.dragPosition.y - previewSize / 2,
			size: previewSize,
		}
	}

	// Calculate grid-aligned position
	const targetBed = beds.find((b) => b.id === currentDragState.targetZoneId)
	if (!targetBed || !currentDragState.highlightedCell) {
		return {
			x: currentDragState.dragPosition.x - previewSize / 2,
			y: currentDragState.dragPosition.y - previewSize / 2,
			size: previewSize,
		}
	}

	const layout = new GardenBedLayoutCalculator({
		width: targetBed.width,
		height: targetBed.height,
		...DEFAULT_LAYOUT_PARAMS,
	})

	const tileLayout = layout.getTileLayoutInfo({
		x: currentDragState.highlightedCell.x,
		y: currentDragState.highlightedCell.y,
		size: effectiveSize,
	})

	const svgElement = document.querySelector<SVGSVGElement>(
		`[data-bed-id='${targetBed.id}'] svg`,
	)

	if (!svgElement) {
		return {
			x: currentDragState.dragPosition.x - previewSize / 2,
			y: currentDragState.dragPosition.y - previewSize / 2,
			size: previewSize,
		}
	}

	const svgRect = svgElement.getBoundingClientRect()
	return {
		x: svgRect.left + tileLayout.svgX,
		y: svgRect.top + tileLayout.svgY,
		size: previewSize,
	}
})
</script>

<style>
.drag-preview {
	position: fixed;
	pointer-events: none;
	z-index: 10000;
	opacity: 0.7;
	transform: rotate(2deg);
	transition: none;
	border-radius: 6px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.clone-indicator {
	position: absolute;
	top: -8px;
	right: -8px;
	background: #28a745;
	color: white;
	border-radius: 50%;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>

{#if draggedInfo && previewPosition}
	<div
		class="drag-preview"
		style="
			left: {previewPosition.x}px;
			top: {previewPosition.y}px;
			width: {previewPosition.size}px;
			height: {previewPosition.size}px;
		"
	>
		{#if isDraggingExistingItem(currentDragState) && isPlant(currentDragState.draggedExistingItem.itemData)}
			{@const placement = existingGridItemToGridPlacement(
				currentDragState.draggedExistingItem,
			)}
			<GridPlacementTile placement={placement} sizePx={previewPosition.size} />
			{#if currentDragState.isCloneMode}
				<div class="clone-indicator">+</div>
			{/if}
		{:else if isDraggingNewItem(currentDragState) && isPlant(currentDragState.draggedNewItem)}
			{@const placement: GridPlacement<PlantWithSize> = {
				id: 'preview',
				x: 0,
				y: 0,
				size: draggedInfo.effectiveSize,
				data: {
					...currentDragState.draggedNewItem,
					size: draggedInfo.effectiveSize,
				} as PlantWithSize,
			}}
			<GridPlacementTile placement={placement} sizePx={previewPosition.size} />
		{/if}
	</div>
{/if}
