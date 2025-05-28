<script lang="ts">
import {
	dragState,
	isDraggingExistingItem,
	isDraggingNewItem,
	isDragStatePopulated,
	getDraggedItemInfo,
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
} from '../state/dragState'
import PlantToolbar from './PlantToolbar.svelte'
import DeleteZone from './DeleteZone.svelte'
import PlantPlacementTile from './PlantPlacementTile.svelte'
import { onDestroy } from 'svelte'
import type { Garden } from '../../lib/garden'
import GardenBedView from './GardenBedView.svelte'
import {
	calculateGardenBedViewColSpans,
	GardenBedLayoutCalculator,
	screenToGridCoordinates,
} from '../../lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'
import {
	type GardenItem,
	type ExistingGardenItem,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
	type GardenDragState,
} from '../state/gardenDragState'
import { dragState as genericDragState } from '../state/dragState'
import { get } from 'svelte/store'

interface GardenProps {
	garden: Garden
	onMovePlantInBed: (bedId: string, plantId: string, newX: number, newY: number) => void
	onMovePlantToDifferentBed: (
		sourceBedId: string,
		targetBedId: string,
		existingItem: ExistingGardenItem,
		newX: number,
		newY: number,
	) => void
	onAddNewPlant: (bedId: string, item: GardenItem, x: number, y: number) => void
	onDeletePlant: (plantId: string, bedId: string) => void
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
	onRequestPlacement: (details: PlacementRequestDetails) => Promise<void>
	onRequestRemoval: (details: RemovalRequestDetails) => Promise<void>
	onRequestCloning: (details: CloningRequestDetails) => Promise<void>
}

let {
	garden,
	onMovePlantInBed,
	onMovePlantToDifferentBed,
	onAddNewPlant,
	onDeletePlant,
	edgeIndicators,
	onRequestPlacement,
	onRequestRemoval,
	onRequestCloning,
}: GardenProps = $props()

let { beds } = $derived(garden)
let gardenRef: HTMLDivElement | null = null

function onGardenMouseMove(event: MouseEvent) {
	const currentCloneMode = event.metaKey || event.altKey

	const currentDragStateVal = get(genericDragState)

	// Only proceed if a drag is active
	if (!(currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem)) {
		return
	}

	let newTargetZoneId: string | null = null
	let newTargetType: 'drop-zone' | 'delete-zone' | null = null
	let newHighlightedCell: { x: number; y: number } | null = null

	// Check if over DeleteZone first (DeleteZone component itself updates targetType on its own mouseenter/leave)
	// So, we primarily just need to respect that if it's set.
	if (currentDragStateVal.targetType === 'delete-zone') {
		newTargetZoneId = null // No specific zone for delete, but targetType is set
		newTargetType = 'delete-zone'
		newHighlightedCell = null
	} else {
		// Iterate over beds to find the target
		for (const bed of beds) {
			const bedComponentElement = gardenRef?.querySelector(`[data-bed-id='${bed.id}']`)
			const svgElement = bedComponentElement?.querySelector('svg') // Assuming the main SVG for coords

			if (bedComponentElement && svgElement) {
				const rect = svgElement.getBoundingClientRect() // Use SVG rect for coordinate calculations relative to grid

				if (
					event.clientX >= rect.left &&
					event.clientX <= rect.right &&
					event.clientY >= rect.top &&
					event.clientY <= rect.bottom
				) {
					const layout = new GardenBedLayoutCalculator({
						width: bed.width,
						height: bed.height,
						...DEFAULT_LAYOUT_PARAMS,
					})
					// Use screenToGridCoordinates as it handles SVG transforms if any
					const gridCoords = screenToGridCoordinates(
						svgElement,
						layout,
						event.clientX,
						event.clientY,
					)
					newTargetZoneId = bed.id
					newTargetType = 'drop-zone'
					newHighlightedCell = gridCoords
					break // Found target bed
				}
			}
		}
	}

	genericDragState.update((s) => ({
		...s,
		dragPosition: { x: event.clientX, y: event.clientY },
		isCloneMode: s.dragSourceType === 'existing-item' ? currentCloneMode : false,
		targetZoneId: newTargetZoneId, // Keep old if delete zone was target
		targetType: newTargetType, // Keep old if delete zone was target
		highlightedCell: newHighlightedCell,
	}))
}

async function onGardenMouseUp(_event: MouseEvent) {
	const currentDragStateVal = get(genericDragState)

	if (
		isDraggingExistingItem(currentDragStateVal) &&
		currentDragStateVal.targetType === 'delete-zone'
	) {
		await handlePlantRemovalRequest(
			currentDragStateVal.draggedExistingItem.id,
			currentDragStateVal.sourceZoneId,
			currentDragStateVal.draggedExistingItem.itemData as GardenItem,
		)
	} else if (
		currentDragStateVal.targetType === 'drop-zone' &&
		currentDragStateVal.targetZoneId &&
		currentDragStateVal.highlightedCell
	) {
		const targetBedId = currentDragStateVal.targetZoneId
		const targetX = currentDragStateVal.highlightedCell.x
		const targetY = currentDragStateVal.highlightedCell.y

		if (isDraggingExistingItem(currentDragStateVal)) {
			const existingItem = currentDragStateVal.draggedExistingItem
			const sourceBedId = currentDragStateVal.sourceZoneId

			if (currentDragStateVal.isCloneMode) {
				await handlePlantCloningRequest(
					sourceBedId,
					targetBedId,
					existingItem.itemData as GardenItem,
					existingItem.x ?? 0,
					existingItem.y ?? 0,
					targetX,
					targetY,
				)
			} else {
				await handlePlantPlacementRequest(
					targetBedId,
					existingItem.itemData as GardenItem,
					targetX,
					targetY,
					existingItem.id,
					sourceBedId,
				)
			}
		} else if (isDraggingNewItem(currentDragStateVal)) {
			await handlePlantPlacementRequest(
				targetBedId,
				currentDragStateVal.draggedNewItem as GardenItem,
				targetX,
				targetY,
			)
		}
	}

	cleanupDrag()
}

function cleanupDrag(): void {
	genericDragState.set({
		draggedNewItem: null,
		draggedExistingItem: null,
		dragSourceType: 'existing-item',
		sourceZoneId: null,
		targetZoneId: null,
		targetType: null,
		dragPosition: { x: 0, y: 0 },
		dragOffset: { x: 0, y: 0 },
		highlightedCell: null,
		isCloneMode: false,
		draggedItemEffectiveSize: 1,
	})
}

async function handlePlantPlacementRequest(
	targetZoneId: string,
	itemData: GardenItem,
	x: number,
	y: number,
	originalInstanceId?: string,
	sourceZoneId?: string,
) {
	const operationId = addPendingOperation<GardenItem>({
		type: 'placement',
		zoneId: targetZoneId,
		x,
		y,
		size: itemData.size ?? 1,
		item: itemData,
		state: 'pending',
	})

	let operationType: PlacementRequestDetails['operationType'] = 'item-add-to-zone'
	if (originalInstanceId && sourceZoneId) {
		operationType =
			sourceZoneId === targetZoneId ? 'item-move-within-zone' : 'item-move-across-zones'
	}

	const placementDetails: PlacementRequestDetails = {
		itemData,
		targetZoneId,
		x,
		y,
		operationType,
		// Explicitly handle optional properties for exactOptionalPropertyTypes
		...(originalInstanceId !== undefined && { originalInstanceId }),
		...(sourceZoneId !== undefined && { sourceZoneId }),
	}

	try {
		await onRequestPlacement(placementDetails)
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			if (operationType === 'item-move-within-zone' && originalInstanceId) {
				onMovePlantInBed(targetZoneId, originalInstanceId, x, y)
			} else if (
				operationType === 'item-move-across-zones' &&
				originalInstanceId &&
				sourceZoneId
			) {
				const sourceBedData = beds.find((b) => b.id === sourceZoneId)
				const originalPp = sourceBedData?.plantPlacements.find(
					(p) => p.id === originalInstanceId,
				)
				if (originalPp) {
					const existingItemForCallback: ExistingGardenItem = {
						id: originalPp.id,
						x: originalPp.x,
						y: originalPp.y,
						itemData: itemData,
						size: itemData.size ?? 1,
					}
					onMovePlantToDifferentBed(
						sourceZoneId,
						targetZoneId,
						existingItemForCallback,
						x,
						y,
					)
				}
			} else if (operationType === 'item-add-to-zone') {
				onAddNewPlant(targetZoneId, itemData, x, y)
			}
		}, 1500)
	} catch (_error: unknown) {
		updatePendingOperation(operationId, 'error')

		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handlePlantRemovalRequest(
	instanceId: string,
	sourceZoneId: string,
	itemData: GardenItem,
) {
	const operationId = addPendingOperation<GardenItem>({
		type: 'removal',
		size: itemData.size ?? 1,
		item: itemData,
		state: 'pending',
	})

	const removalDetails: RemovalRequestDetails = {
		itemData,
		instanceId,
		sourceZoneId,
		operationType: 'item-remove-from-zone',
	}

	try {
		await onRequestRemoval(removalDetails)
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			onDeletePlant(instanceId, sourceZoneId)
		}, 1500)
	} catch (error: unknown) {
		updatePendingOperation(operationId, 'error')

		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handlePlantCloningRequest(
	sourceOriginalZoneId: string,
	targetCloneZoneId: string,
	itemDataToClone: GardenItem,
	sourceOriginalX: number,
	sourceOriginalY: number,
	targetCloneX: number,
	targetCloneY: number,
) {
	const operationId = addPendingOperation<GardenItem>({
		type: 'placement',
		zoneId: targetCloneZoneId,
		x: targetCloneX,
		y: targetCloneY,
		size: itemDataToClone.size ?? 1,
		item: itemDataToClone,
		state: 'pending',
	})

	const cloningDetails: CloningRequestDetails = {
		itemDataToClone,
		sourceOriginalZoneId,
		targetCloneZoneId,
		sourceOriginalX,
		sourceOriginalY,
		targetCloneX,
		targetCloneY,
		operationType: 'item-clone-in-zone',
	}

	try {
		await onRequestCloning(cloningDetails)
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			const clonedCoreItem: GardenItem = {
				...itemDataToClone,
			}
			onAddNewPlant(targetCloneZoneId, clonedCoreItem, targetCloneX, targetCloneY)
		}, 1500)
	} catch (error: unknown) {
		updatePendingOperation(operationId, 'error')

		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

$effect(() => {
	const state = $dragState
	const isDragging = state.draggedExistingItem !== null || state.draggedNewItem !== null

	if (isDragging) {
		window.addEventListener('mousemove', onGardenMouseMove)
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		window.addEventListener('mouseup', onGardenMouseUp)

		return () => {
			window.removeEventListener('mousemove', onGardenMouseMove)
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			window.removeEventListener('mouseup', onGardenMouseUp)
		}
	}
})

onDestroy(() => {
	window.removeEventListener('mousemove', onGardenMouseMove)
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	window.removeEventListener('mouseup', onGardenMouseUp)
})

// Reinstate the reactive calculation for column spans using the original garden object
let gardenBedCardColSpans = $derived(calculateGardenBedViewColSpans(garden))
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

.custom-garden-grid {
	display: grid;
	gap: 1rem; /* Or your preferred gap, e.g., 16px */
	grid-template-columns: 1fr; /* Default to 1 column */
}

/* Medium screens, e.g., tablets */
@media (min-width: 768px) {
	.custom-garden-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

/* Large screens, e.g., small laptops */
@media (min-width: 1024px) {
	.custom-garden-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

/* Extra-large screens, e.g., desktops */
@media (min-width: 1280px) {
	.custom-garden-grid {
		grid-template-columns: repeat(4, 1fr);
	}
}

/* XXL screens, e.g., large desktops */
@media (min-width: 1536px) {
	.custom-garden-grid {
		grid-template-columns: repeat(5, 1fr);
	}
}
</style>

<div class="garden-container">
	<PlantToolbar />

	<div class="garden" bind:this={gardenRef}>
		<div class="grid grid-flow-row-dense grid-cols-4 gap-4">
			{#each beds as bed (bed.id)}
				<GardenBedView
					bed={bed}
					edgeIndicators={edgeIndicators.filter(
						(indicator) =>
							bed.plantPlacements.some((p) => p.id === indicator.plantAId) ||
							bed.plantPlacements.some((p) => p.id === indicator.plantBId),
					)}
					class="col-span-{gardenBedCardColSpans[bed.id]}"
				/>
			{/each}
		</div>
	</div>

	<DeleteZone />

	{#if isDragStatePopulated($genericDragState as GardenDragState)}
		{@const draggedInfo = getDraggedItemInfo($genericDragState as GardenDragState)}
		{#if draggedInfo}
			{@const effectiveSize = draggedInfo.effectiveSize}
			{@const cellSize = DEFAULT_LAYOUT_PARAMS.cellSize}
			{@const previewSize = cellSize * effectiveSize}
			{@const currentPreviewDragState = $genericDragState as GardenDragState}
			{@const shouldAlignToGrid =
				currentPreviewDragState.targetZoneId && currentPreviewDragState.highlightedCell}
			{@const previewX = shouldAlignToGrid
				? (() => {
						const targetBed = beds.find(
							(b) => b.id === currentPreviewDragState.targetZoneId,
						)
						if (!targetBed || !currentPreviewDragState.highlightedCell)
							return currentPreviewDragState.dragPosition.x - previewSize / 2
						const layout = new GardenBedLayoutCalculator({
							width: targetBed.width,
							height: targetBed.height,
							...DEFAULT_LAYOUT_PARAMS,
						})
						const tileLayout = layout.getTileLayoutInfo({
							x: currentPreviewDragState.highlightedCell.x,
							y: currentPreviewDragState.highlightedCell.y,
							size: effectiveSize,
						})
						const svgElement = document.querySelector<SVGSVGElement>(
							`[data-bed-id='${targetBed.id}'] svg`,
						)
						if (!svgElement)
							return currentPreviewDragState.dragPosition.x - previewSize / 2
						const svgRect = svgElement.getBoundingClientRect()
						return svgRect.left + tileLayout.svgX
					})()
				: currentPreviewDragState.dragPosition.x - previewSize / 2}
			{@const previewY = shouldAlignToGrid
				? (() => {
						const targetBed = beds.find(
							(b) => b.id === currentPreviewDragState.targetZoneId,
						)
						if (!targetBed || !currentPreviewDragState.highlightedCell)
							return currentPreviewDragState.dragPosition.y - previewSize / 2
						const layout = new GardenBedLayoutCalculator({
							width: targetBed.width,
							height: targetBed.height,
							...DEFAULT_LAYOUT_PARAMS,
						})
						const tileLayout = layout.getTileLayoutInfo({
							x: currentPreviewDragState.highlightedCell.x,
							y: currentPreviewDragState.highlightedCell.y,
							size: effectiveSize,
						})
						const svgElement = document.querySelector<SVGSVGElement>(
							`[data-bed-id='${targetBed.id}'] svg`,
						)
						if (!svgElement)
							return currentPreviewDragState.dragPosition.y - previewSize / 2
						const svgRect = svgElement.getBoundingClientRect()
						return svgRect.top + tileLayout.svgY
					})()
				: currentPreviewDragState.dragPosition.y - previewSize / 2}
			<div
				class="drag-preview"
				style="
					left: {previewX}px;
					top: {previewY}px;
					width: {previewSize}px;
					height: {previewSize}px;
				"
			>
				{#if isDraggingExistingItem(currentPreviewDragState)}
					<PlantPlacementTile
						plantPlacement={currentPreviewDragState.draggedExistingItem as any}
						sizePx={previewSize}
					/>
					{#if currentPreviewDragState.isCloneMode}
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
				{:else if isDraggingNewItem(currentPreviewDragState)}
					<PlantPlacementTile
						plantPlacement={{
							id: 'preview',
							x: 0,
							y: 0,
							itemData: currentPreviewDragState.draggedNewItem,
						} as any}
						sizePx={previewSize}
					/>
				{/if}
			</div>
		{/if}
	{/if}
</div>
