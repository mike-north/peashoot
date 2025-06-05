<script lang="ts">
import GridPlacementTile from './GridPlacementTile.svelte'
import type { GridPlacement, GridPlaceable } from '../grid-placement'
import { dragState as genericDragState } from '../../dnd/state'
import {
	isGridDragStatePopulated,
	isGridDraggingExistingItem,
	isGridDraggingNewItem,
} from '../grid-drag-state'
import { isGridPlaceable } from '../grid-placement'
import type { GardenDragState } from '../../../private/state/gardenDragState'
import { ZoneLayoutCalculator } from '../zone-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../grid-layout-constants'
import type { GridArea } from '../grid-area'

interface Props {
	grids: GridArea<GridPlaceable>[]
	tileSizeForItem: (item: GridPlaceable) => number
}

const { grids, tileSizeForItem }: Props = $props()

let currentDragState = $derived($genericDragState as GardenDragState<GridPlaceable>)

let draggedItemForPreview: GridPlaceable | null = $derived(null)
let previewGridFootprintSize = $derived(1)

$effect(() => {
	if (isGridDragStatePopulated(currentDragState)) {
		if (
			isGridDraggingNewItem(currentDragState) &&
			isGridPlaceable(currentDragState.draggedNewItem)
		) {
			draggedItemForPreview = currentDragState.draggedNewItem
			previewGridFootprintSize = currentDragState.draggedNewItem.presentation.size
		} else if (
			isGridDraggingExistingItem(currentDragState) &&
			isGridPlaceable(currentDragState.draggedExistingItem.item)
		) {
			draggedItemForPreview = currentDragState.draggedExistingItem.item
			previewGridFootprintSize =
				currentDragState.draggedExistingItem.item.presentation.size
		} else {
			draggedItemForPreview = null
			previewGridFootprintSize = 1
		}
	} else {
		draggedItemForPreview = null
		previewGridFootprintSize = 1
	}
})

let previewPosition = $derived.by(() => {
	if (!draggedItemForPreview) return null

	const cellSize = DEFAULT_LAYOUT_PARAMS.cellSize
	const actualPreviewSizePx = cellSize * previewGridFootprintSize

	const shouldAlignToGrid =
		currentDragState.targetZoneId && currentDragState.highlightedCell

	if (!shouldAlignToGrid) {
		return {
			x: currentDragState.dragPosition.x - actualPreviewSizePx / 2,
			y: currentDragState.dragPosition.y - actualPreviewSizePx / 2,
			size: actualPreviewSizePx,
		}
	}

	const targetBed = grids.find((b) => b.id === currentDragState.targetZoneId)
	if (!targetBed || !currentDragState.highlightedCell) {
		return {
			x: currentDragState.dragPosition.x - actualPreviewSizePx / 2,
			y: currentDragState.dragPosition.y - actualPreviewSizePx / 2,
			size: actualPreviewSizePx,
		}
	}

	const layout = new ZoneLayoutCalculator({
		width: targetBed.width,
		height: targetBed.height,
		tileSizeForItem,
		...DEFAULT_LAYOUT_PARAMS,
	})

	const tileLayout = layout.getTileLayoutInfo({
		x: currentDragState.highlightedCell.x,
		y: currentDragState.highlightedCell.y,
		size: previewGridFootprintSize,
	})

	const svgElement = document.querySelector<SVGSVGElement>(
		`[data-zone-id='${targetBed.id}'] svg`,
	)

	if (!svgElement) {
		return {
			x: currentDragState.dragPosition.x - actualPreviewSizePx / 2,
			y: currentDragState.dragPosition.y - actualPreviewSizePx / 2,
			size: actualPreviewSizePx,
		}
	}

	const svgRect = svgElement.getBoundingClientRect()
	return {
		x: svgRect.left + tileLayout.svgX,
		y: svgRect.top + tileLayout.svgY,
		size: actualPreviewSizePx,
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

{#if draggedItemForPreview && previewPosition}
	<div
		class="drag-preview"
		style="
			left: {previewPosition.x}px;
			top: {previewPosition.y}px;
			width: {previewPosition.size}px;
			height: {previewPosition.size}px;
		"
	>
		{#if isGridDraggingExistingItem(currentDragState) && isGridPlaceable(currentDragState.draggedExistingItem.item)}
			{@const itemToRender = currentDragState.draggedExistingItem.item}
			{@const placementForTile: GridPlacement<GridPlaceable> = {
				id: currentDragState.draggedExistingItem.id,
				x: currentDragState.draggedExistingItem.x,
				y: currentDragState.draggedExistingItem.y,
				size: itemToRender.presentation.size,
				item: itemToRender,
				sourceZoneId: currentDragState.draggedExistingItem.sourceZoneId
			}}
			<GridPlacementTile placement={placementForTile} sizePx={previewPosition.size} />
			{#if currentDragState.isCloneMode}
				<div class="clone-indicator">+</div>
			{/if}
		{:else if isGridDraggingNewItem(currentDragState) && isGridPlaceable(currentDragState.draggedNewItem)}
			{@const itemToRender = currentDragState.draggedNewItem}
			{@const placementForTile: GridPlacement<GridPlaceable> = {
				id: 'preview',
				x: 0,
				y: 0,
				size: itemToRender.presentation.size,
				item: itemToRender,
				sourceZoneId: '',
			}}
			<GridPlacementTile placement={placementForTile} sizePx={previewPosition.size} />
		{/if}
	</div>
{/if}
