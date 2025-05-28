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
import { dragManager, type DragManager } from '../../lib/dnd/drag-manager'

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

const gardenDragManager = dragManager as DragManager<GardenItem>

function onGardenMouseMove(event: MouseEvent) {
	const currentCloneMode = event.metaKey || event.altKey
	// console.log('[GardenView onGardenMouseMove] event.target:', event.target)

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

async function onGardenMouseUp(event: MouseEvent) {
	const currentDragStateVal = get(genericDragState)
	console.log('[GardenView onGardenMouseUp] Event Target:', event.target)
	console.log(
		'[GardenView onGardenMouseUp] State at start:',
		JSON.parse(JSON.stringify(currentDragStateVal)),
	)
	console.log(
		'[GardenView onGardenMouseUp] Clone Mode Check - isCloneMode:',
		currentDragStateVal.isCloneMode,
		'isDraggingExistingItem:',
		isDraggingExistingItem(currentDragStateVal),
	)

	if (
		isDraggingExistingItem(currentDragStateVal) &&
		currentDragStateVal.targetType === 'delete-zone'
	) {
		console.log('[GardenView] Drop on DeleteZone detected.')
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
				console.log(
					`[GardenView] CLONE operation detected. Source: ${sourceBedId}, Target: ${targetBedId}`,
				)
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
				console.log(
					`[GardenView] MOVE operation detected. Source: ${sourceBedId}, Target: ${targetBedId}`,
				)
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
			console.log(`[GardenView] ADD NEW ITEM operation to bed ${targetBedId}`)
			await handlePlantPlacementRequest(
				targetBedId,
				currentDragStateVal.draggedNewItem as GardenItem,
				targetX,
				targetY,
			)
		} else {
			console.log(
				'[GardenView] Drop on bed zone, but no draggable item identified correctly.',
			)
		}
	} else {
		console.log('[GardenView] Drop on unhandled area or drag cancelled.')
	}

	cleanupDrag()
}

function cleanupDrag(): void {
	gardenDragManager.cleanup()
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
		console.log(
			'[GardenView] Placement Request: try block entered. Details:',
			JSON.stringify(placementDetails, null, 2),
		)
		await onRequestPlacement(placementDetails)
		console.log('[GardenView] Placement Request: onRequestPlacement SUCCEEDED.')
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
	} catch (error: unknown) {
		console.error(
			'[GardenView] Placement Request: CATCH block. onRequestPlacement REJECTED:',
			error instanceof Error ? error.message : String(error),
			error,
		)
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
		console.log(
			'[GardenView] Removal Request: try block entered. Details:',
			JSON.stringify(removalDetails, null, 2),
		)
		await onRequestRemoval(removalDetails)
		console.log('[GardenView] Removal Request: onRequestRemoval SUCCEEDED.')
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			onDeletePlant(instanceId, sourceZoneId)
		}, 1500)
	} catch (error: unknown) {
		console.error(
			'[GardenView] Removal Request: CATCH block. onRequestRemoval REJECTED:',
			error instanceof Error ? error.message : String(error),
			error,
		)
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
		console.log(
			'[GardenView] Cloning Request: try block entered. Details:',
			JSON.stringify(cloningDetails, null, 2),
		)
		await onRequestCloning(cloningDetails)
		console.log('[GardenView] Cloning Request: onRequestCloning SUCCEEDED.')
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			const clonedCoreItem: GardenItem = {
				...itemDataToClone,
			}
			onAddNewPlant(targetCloneZoneId, clonedCoreItem, targetCloneX, targetCloneY)
		}, 1500)
	} catch (error: unknown) {
		console.error(
			'[GardenView] Cloning Request: CATCH block. onRequestCloning REJECTED:',
			error instanceof Error ? error.message : String(error),
			error,
		)
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
			<GardenBedView bed={bed} edgeIndicators={edgeIndicators} />
		{/each}
	</div>

	<DeleteZone />

	<!-- TEMPORARILY DISABLED DRAG PREVIEW FOR DEBUGGING -->
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
