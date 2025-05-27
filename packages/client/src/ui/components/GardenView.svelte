<script lang="ts">
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import {
	dragState,
	isDraggingExistingPlant,
	isDraggingNewPlant,
	isDragStatePopulated,
	getDraggedPlantInfo,
} from '../state/dragState'
import { dragManager } from '../../lib/drag-manager'
import PlantToolbar from './PlantToolbar.svelte'
import DeleteZone from './DeleteZone.svelte'
import PlantPlacementTile from './PlantPlacementTile.svelte'
import type { GardenBed } from '../../lib/garden-bed'
import { onDestroy } from 'svelte'
import type { Garden } from '../../lib/garden'
import GardenBedView from './GardenBedView.svelte'
import {
	GardenBedLayoutCalculator,
	screenToGridCoordinates,
	isValidDrop,
} from '../../lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'

interface GardenProps {
	garden: Garden
	onMovePlantInBed: (bedId: string, plantId: string, newX: number, newY: number) => void
	onMovePlantToDifferentBed: (
		sourceBedId: string,
		targetBedId: string,
		plant: PlantPlacement,
		newX: number,
		newY: number,
	) => void
	onAddNewPlant: (bedId: string, plant: Plant, x: number, y: number) => void
	onDeletePlant: (plantId: string, bedId: string) => void
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
}

let {
	garden,
	onMovePlantInBed,
	onMovePlantToDifferentBed,
	onAddNewPlant,
	onDeletePlant,
	edgeIndicators,
}: GardenProps = $props()

let { beds } = $derived(garden)
let gardenRef: HTMLDivElement | null = null

function handleTileMouseDown(plant: PlantPlacement, bedId: string, event: MouseEvent) {
	// Use the drag manager to start dragging an existing plant
	dragManager.startDraggingExistingPlant(plant, bedId, event)
}

function onGardenMouseMove(event: MouseEvent) {
	// Don't override delete zone targeting
	if ($dragState.targetType === 'delete-zone') {
		// Just update the drag position but keep the delete zone as target
		dragState.update((s) => ({
			...s,
			dragPosition: { x: event.clientX, y: event.clientY },
		}))
		return
	}

	// For each bed, check if mouse is over its SVG
	for (const bed of beds) {
		const svgElement: (SVGSVGElement & SVGGraphicsElement) | null =
			document.querySelector(`[data-bed-id='${bed.id}'] svg`)
		if (!svgElement) continue
		const rect = svgElement.getBoundingClientRect()

		if (
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom
		) {
			// Mouse is over this bed
			// Create a layout calculator for this specific bed to get accurate metrics
			const layout = new GardenBedLayoutCalculator({
				width: bed.width,
				height: bed.height,
				// Use default layout params from constants
				...DEFAULT_LAYOUT_PARAMS,
			})

			// Use the factored-out screenToGridCoordinates
			const { x, y } = screenToGridCoordinates(
				svgElement,
				layout,
				event.clientX,
				event.clientY,
			)

			dragState.update((s) => ({
				...s,
				targetBedId: bed.id,
				targetType: 'garden-bed',
				dragPosition: { x: event.clientX, y: event.clientY },
				highlightedCell: { x, y },
			}))
			return
		}
	}
	// If not over any bed, clear targetBedId and highlightedCell
	dragState.update((s) => ({
		...s,
		targetBedId: null,
		targetType: null,
		highlightedCell: null,
		dragPosition: { x: event.clientX, y: event.clientY },
	}))
}

function onGardenMouseUp(_event: MouseEvent) {
	const state = $dragState
	console.log('[GardenView] onGardenMouseUp: state', JSON.parse(JSON.stringify(state)))

	// Handle delete zone drops
	if (isDraggingExistingPlant(state) && state.targetType === 'delete-zone') {
		console.log(
			'[GardenView] onGardenMouseUp: Deleting plant',
			state.draggedPlant.id,
			'from bed',
			state.sourceBedId,
		)
		onDeletePlant(state.draggedPlant.id, state.sourceBedId)
		cleanupDrag()
		return
	}

	// Handle existing plant drops to garden beds
	if (isDraggingExistingPlant(state) && state.targetBedId && state.highlightedCell) {
		const draggedPlant = state.draggedPlant
		const highlightedCell = state.highlightedCell
		const currentSourceBedId = state.sourceBedId
		const currentTargetBedId = state.targetBedId

		const targetBed = beds.find((b: GardenBed) => b.id === currentTargetBedId)

		console.log(
			'[GardenView] onGardenMouseUp: Details - ',
			'Dragged Plant ID:',
			draggedPlant.id,
			'Original Coords:',
			{ x: draggedPlant.x, y: draggedPlant.y },
			'Size:',
			state.draggedTileSize,
			'Target Bed ID:',
			targetBed ? targetBed.id : 'null',
			'Source Bed ID:',
			currentSourceBedId,
			'Highlighted Cell:',
			highlightedCell,
		)

		if (!targetBed) {
			console.log('[GardenView] onGardenMouseUp: No target bed found. Cleaning up.')
			cleanupDrag()
			return
		}

		const isValid = isValidDrop(
			targetBed,
			draggedPlant,
			highlightedCell.x,
			highlightedCell.y,
		)
		console.log(
			'[GardenView] onGardenMouseUp: isValidDrop returned:',
			isValid,
			'for cell:',
			highlightedCell,
			'in bed:',
			currentTargetBedId,
		)

		if (!isValid) {
			console.log('[GardenView] onGardenMouseUp: Drop is not valid. Cleaning up.')
			cleanupDrag()
			return
		}

		if (currentSourceBedId === currentTargetBedId) {
			// Move within the same bed
			onMovePlantInBed(
				currentSourceBedId,
				draggedPlant.id,
				highlightedCell.x,
				highlightedCell.y,
			)
		} else {
			// Move to a different bed
			onMovePlantToDifferentBed(
				currentSourceBedId,
				currentTargetBedId,
				draggedPlant,
				highlightedCell.x,
				highlightedCell.y,
			)
		}
	}
	// Handle new plant drops from toolbar
	else if (isDraggingNewPlant(state) && state.targetBedId && state.highlightedCell) {
		const draggedNewPlant = state.draggedNewPlant
		const highlightedCell = state.highlightedCell
		const currentTargetBedId = state.targetBedId

		const targetBed = beds.find((b: GardenBed) => b.id === currentTargetBedId)

		console.log(
			'[GardenView] onGardenMouseUp: New Plant Drop - ',
			'Plant:',
			draggedNewPlant.name,
			'Size:',
			state.draggedTileSize,
			'Target Bed ID:',
			targetBed ? targetBed.id : 'null',
			'Highlighted Cell:',
			highlightedCell,
		)

		if (!targetBed) {
			console.log(
				'[GardenView] onGardenMouseUp: No target bed found for new plant. Cleaning up.',
			)
			cleanupDrag()
			return
		}

		// For new plants, we need to create a temporary placement to check validity
		const tempPlacement: PlantPlacement = {
			id: 'temp',
			x: highlightedCell.x,
			y: highlightedCell.y,
			plantTile: draggedNewPlant,
		}

		const isValid = isValidDrop(
			targetBed,
			tempPlacement,
			highlightedCell.x,
			highlightedCell.y,
		)

		console.log(
			'[GardenView] onGardenMouseUp: New plant isValidDrop returned:',
			isValid,
			'for cell:',
			highlightedCell,
			'in bed:',
			currentTargetBedId,
		)

		if (!isValid) {
			console.log(
				'[GardenView] onGardenMouseUp: New plant drop is not valid. Cleaning up.',
			)
			cleanupDrag()
			return
		}

		// Add the new plant
		onAddNewPlant(
			currentTargetBedId,
			draggedNewPlant,
			highlightedCell.x,
			highlightedCell.y,
		)
	} else {
		console.log(
			'[GardenView] onGardenMouseUp: Aborted due to invalid drag state or missing target information.',
		)
	}
	cleanupDrag()
}

function cleanupDrag(): void {
	dragManager.cleanup()
}

// Manage mouse listeners based on drag state
$effect(() => {
	const state = $dragState
	const isDragging = state.draggedPlant !== null || state.draggedNewPlant !== null

	if (isDragging) {
		// Add listeners when any drag starts
		window.addEventListener('mousemove', onGardenMouseMove)
		window.addEventListener('mouseup', onGardenMouseUp)

		// Cleanup function
		return () => {
			window.removeEventListener('mousemove', onGardenMouseMove)
			window.removeEventListener('mouseup', onGardenMouseUp)
		}
	}
})

onDestroy(() => {
	window.removeEventListener('mousemove', onGardenMouseMove)
	window.removeEventListener('mouseup', onGardenMouseUp)
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
</style>

<div class="garden-container">
	<PlantToolbar />

	<div class="garden" bind:this={gardenRef}>
		{#each beds as bed (bed.id)}
			<GardenBedView
				bed={bed}
				edgeIndicators={edgeIndicators}
				onTileMouseDownFromParent={handleTileMouseDown}
			/>
		{/each}
	</div>

	<DeleteZone />

	<!-- Drag Preview -->
	{#if isDragStatePopulated($dragState)}
		{@const draggedInfo = getDraggedPlantInfo($dragState)}
		{#if draggedInfo}
			{@const cellSize = DEFAULT_LAYOUT_PARAMS.cellSize}
			{@const previewSize = cellSize * draggedInfo.size}
			<!-- Position the preview to align with the highlight when over a bed -->
			{@const shouldAlignToGrid = $dragState.targetBedId && $dragState.highlightedCell}
			{@const previewX = shouldAlignToGrid
				? (() => {
						const targetBed = beds.find((b) => b.id === $dragState.targetBedId)
						if (!targetBed) return $dragState.dragPosition.x - previewSize / 2
						const layout = new GardenBedLayoutCalculator({
							width: targetBed.width,
							height: targetBed.height,
							...DEFAULT_LAYOUT_PARAMS,
						})
						const tileLayout = layout.getTileLayoutInfo({
							x: $dragState.highlightedCell.x,
							y: $dragState.highlightedCell.y,
							size: draggedInfo.size,
						})
						const svgElement = document.querySelector(
							`[data-bed-id='${targetBed.id}'] svg`,
						)
						if (!svgElement) return $dragState.dragPosition.x - previewSize / 2
						const rect = svgElement.getBoundingClientRect()
						return rect.left + tileLayout.svgX
					})()
				: $dragState.dragPosition.x - previewSize / 2}
			{@const previewY = shouldAlignToGrid
				? (() => {
						const targetBed = beds.find((b) => b.id === $dragState.targetBedId)
						if (!targetBed) return $dragState.dragPosition.y - previewSize / 2
						const layout = new GardenBedLayoutCalculator({
							width: targetBed.width,
							height: targetBed.height,
							...DEFAULT_LAYOUT_PARAMS,
						})
						const tileLayout = layout.getTileLayoutInfo({
							x: $dragState.highlightedCell.x,
							y: $dragState.highlightedCell.y,
							size: draggedInfo.size,
						})
						const svgElement = document.querySelector(
							`[data-bed-id='${targetBed.id}'] svg`,
						)
						if (!svgElement) return $dragState.dragPosition.y - previewSize / 2
						const rect = svgElement.getBoundingClientRect()
						return rect.top + tileLayout.svgY
					})()
				: $dragState.dragPosition.y - previewSize / 2}
			<div
				class="drag-preview"
				style="
					left: {previewX}px;
					top: {previewY}px;
					width: {previewSize}px;
					height: {previewSize}px;
				"
			>
				{#if isDraggingExistingPlant($dragState)}
					<PlantPlacementTile
						plantPlacement={$dragState.draggedPlant}
						sizePx={previewSize}
					/>
				{:else if isDraggingNewPlant($dragState)}
					<PlantPlacementTile
						plantPlacement={{
							id: 'preview',
							x: 0,
							y: 0,
							plantTile: $dragState.draggedNewPlant,
						}}
						sizePx={previewSize}
					/>
				{/if}
			</div>
		{/if}
	{/if}
</div>
