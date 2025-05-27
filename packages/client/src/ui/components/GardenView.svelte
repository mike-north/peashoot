<script lang="ts">
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import {
	dragState,
	isDraggingExistingPlant,
	isDraggingNewPlant,
	isDragStatePopulated,
	getDraggedPlantInfo,
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
	defaultAsyncValidation,
	type AsyncValidationFunction,
	type ValidationContext,
	type OperationType,
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
	asyncValidation?: AsyncValidationFunction
}

let {
	garden,
	onMovePlantInBed,
	onMovePlantToDifferentBed,
	onAddNewPlant,
	onDeletePlant,
	edgeIndicators,
	asyncValidation = defaultAsyncValidation,
}: GardenProps = $props()

let { beds } = $derived(garden)
let gardenRef: HTMLDivElement | null = null

function handleTileMouseDown(plant: PlantPlacement, bedId: string, event: MouseEvent) {
	// Use the drag manager to start dragging an existing plant
	dragManager.startDraggingExistingPlant(plant, bedId, event)
}

function onGardenMouseMove(event: MouseEvent) {
	// Update clone mode based on current modifier keys
	const currentCloneMode = event.metaKey || event.altKey
	dragState.update((s) => ({
		...s,
		isCloneMode: s.dragSourceType === 'existing-plant' ? currentCloneMode : false,
	}))

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

	// Handle delete zone drops
	if (isDraggingExistingPlant(state) && state.targetType === 'delete-zone') {
		handleAsyncPlantRemoval(
			state.draggedPlant.id,
			state.sourceBedId,
			state.draggedPlant.plantTile,
		)
		cleanupDrag()
		return
	}

	// Handle existing plant drops to garden beds
	if (isDraggingExistingPlant(state) && state.targetBedId && state.highlightedCell) {
		const draggedPlant = state.draggedPlant
		const highlightedCell = state.highlightedCell
		const currentSourceBedId = state.sourceBedId
		const currentTargetBedId = state.targetBedId
		const isCloneMode = state.isCloneMode

		const targetBed = beds.find((b: GardenBed) => b.id === currentTargetBedId)

		if (!targetBed) {
			cleanupDrag()
			return
		}

		const isValid = isValidDrop(
			targetBed,
			draggedPlant,
			highlightedCell.x,
			highlightedCell.y,
		)

		if (!isValid) {
			cleanupDrag()
			return
		}

		// Start async operation, but cleanup drag state immediately
		if (isCloneMode) {
			handleAsyncPlantCloning(
				currentSourceBedId,
				currentTargetBedId,
				draggedPlant.plantTile,
				draggedPlant.x,
				draggedPlant.y,
				highlightedCell.x,
				highlightedCell.y,
			)
		} else {
			handleAsyncPlantPlacement(
				currentTargetBedId,
				draggedPlant.plantTile,
				highlightedCell.x,
				highlightedCell.y,
				draggedPlant.id,
				currentSourceBedId,
			)
		}
		cleanupDrag()
		return
	}
	// Handle new plant drops from toolbar
	else if (isDraggingNewPlant(state) && state.targetBedId && state.highlightedCell) {
		const draggedNewPlant = state.draggedNewPlant
		const highlightedCell = state.highlightedCell
		const currentTargetBedId = state.targetBedId

		const targetBed = beds.find((b) => b.id === currentTargetBedId)

		if (!targetBed) {
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

		if (!isValid) {
			cleanupDrag()
			return
		}

		// Start async operation, but cleanup drag state immediately
		handleAsyncPlantPlacement(
			currentTargetBedId,
			draggedNewPlant,
			highlightedCell.x,
			highlightedCell.y,
		)
		cleanupDrag()
		return
	} else {
		cleanupDrag()
	}
}

function cleanupDrag(): void {
	dragManager.cleanup()
}

// Async handlers for plant operations
async function handleAsyncPlantPlacement(
	bedId: string,
	plant: Plant,
	x: number,
	y: number,
	originalPlantId?: string,
	originalBedId?: string,
) {
	const operationId = addPendingOperation({
		type: 'placement',
		bedId,
		x,
		y,
		size: plant.size || 1,
		plant,
		state: 'pending',
	})

	// Determine operation type and build validation context
	let operationType: OperationType
	let validationContext: ValidationContext

	if (originalPlantId && originalBedId) {
		// This is a plant move
		if (originalBedId === bedId) {
			operationType = 'within-bed-move'
		} else {
			operationType = 'across-beds-move'
		}

		// Find the original plant to get source coordinates
		const sourceBed = beds.find((b) => b.id === originalBedId)
		const originalPlant = sourceBed?.plantPlacements.find((p) => p.id === originalPlantId)

		validationContext = {
			operationType,
			garden,
			plant,
			plantId: originalPlantId,
			sourceBedId: originalBedId,
			targetBedId: bedId,
			sourceX: originalPlant?.x,
			sourceY: originalPlant?.y,
			targetX: x,
			targetY: y,
		}
	} else {
		// This is a new plant addition
		operationType = 'addition'
		validationContext = {
			operationType,
			garden,
			plant,
			targetBedId: bedId,
			targetX: x,
			targetY: y,
		}
	}

	try {
		await asyncValidation(validationContext)
		updatePendingOperation(operationId, 'success')

		// Wait for success animation
		setTimeout(() => {
			removePendingOperation(operationId)
			// Actually perform the operation after validation succeeds
			if (originalPlantId && originalBedId) {
				if (originalBedId === bedId) {
					onMovePlantInBed(bedId, originalPlantId, x, y)
				} else {
					// Create a temporary placement for the move operation
					const tempPlacement: PlantPlacement = {
						id: originalPlantId,
						x: 0, // Will be updated
						y: 0, // Will be updated
						plantTile: plant,
					}
					onMovePlantToDifferentBed(originalBedId, bedId, tempPlacement, x, y)
				}
			} else {
				onAddNewPlant(bedId, plant, x, y)
			}
		}, 1500)
	} catch (_error: unknown) {
		updatePendingOperation(operationId, 'error')

		// Wait for error animation then remove
		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handleAsyncPlantRemoval(plantId: string, bedId: string, plant: Plant) {
	const operationId = addPendingOperation({
		type: 'removal',
		size: plant.size || 1,
		plant,
		state: 'pending',
	})

	// Find the plant to get source coordinates
	const sourceBed = beds.find((b) => b.id === bedId)
	const plantToRemove = sourceBed?.plantPlacements.find((p) => p.id === plantId)

	const validationContext: ValidationContext = {
		operationType: 'removal',
		garden,
		plant,
		plantId,
		sourceBedId: bedId,
		sourceX: plantToRemove?.x,
		sourceY: plantToRemove?.y,
	}

	try {
		await asyncValidation(validationContext)
		updatePendingOperation(operationId, 'success')

		// Wait for success animation
		setTimeout(() => {
			removePendingOperation(operationId)
			onDeletePlant(plantId, bedId)
		}, 1500)
	} catch (error) {
		updatePendingOperation(operationId, 'error')

		// Wait for error animation then remove
		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handleAsyncPlantCloning(
	sourceBedId: string,
	targetBedId: string,
	plant: Plant,
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
) {
	const operationId = addPendingOperation({
		type: 'placement',
		bedId: targetBedId,
		x: targetX,
		y: targetY,
		size: plant.size || 1,
		plant,
		state: 'pending',
	})

	const validationContext: ValidationContext = {
		operationType: 'clone',
		garden,
		plant,
		sourceBedId,
		targetBedId,
		sourceX,
		sourceY,
		targetX,
		targetY,
	}

	try {
		await asyncValidation(validationContext)
		updatePendingOperation(operationId, 'success')

		// Wait for success animation
		setTimeout(() => {
			removePendingOperation(operationId)
			// Create a new plant with a unique ID for the clone
			const clonedPlant: Plant = {
				...plant,
				id: `cloned-${plant.id}-${Date.now()}`,
			}
			onAddNewPlant(targetBedId, clonedPlant, targetX, targetY)
		}, 1500)
	} catch (_error: unknown) {
		updatePendingOperation(operationId, 'error')

		// Wait for error animation then remove
		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
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
						const highlightedCell = $dragState.highlightedCell
						if (!highlightedCell) return null
						const tileLayout = layout.getTileLayoutInfo({
							x: highlightedCell.x,
							y: highlightedCell.y,
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
						const { highlightedCell } = $dragState
						if (!highlightedCell) return null
						const tileLayout = layout.getTileLayoutInfo({
							x: highlightedCell.x,
							y: highlightedCell.y,
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
					<!-- Clone mode indicator -->
					{#if $dragState.isCloneMode}
						<div
							class="clone-indicator"
							style="
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
								box-shadow: 0 2px 4px rgba(0,0,0,0.3);
							"
						>
							+
						</div>
					{/if}
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
