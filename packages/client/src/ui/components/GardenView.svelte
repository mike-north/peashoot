<script lang="ts">
import type { PlantPlacement } from '../../lib/plant-placement'
import {
	dragState,
	isDraggingExistingItem,
	isDraggingNewItem,
	isDragStatePopulated,
	getDraggedItemInfo,
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
	defaultAsyncValidation,
	type OperationType as GenericOperationType,
} from '../state/dragState'
import PlantToolbar from './PlantToolbar.svelte'
import DeleteZone from './DeleteZone.svelte'
import PlantPlacementTile from './PlantPlacementTile.svelte' // Changed from PlantTile
import { onDestroy } from 'svelte'
import type { Garden } from '../../lib/garden'
import GardenBedView from './GardenBedView.svelte'
import {
	GardenBedLayoutCalculator,
	screenToGridCoordinates,
} from '../../lib/garden-bed-layout-calculator'
import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'
import {
	plantPlacementToExistingGardenItem,
	type GardenItem,
	type ExistingGardenItem,
	type GardenZoneContext,
	type GardenValidationContext,
	type GardenAsyncValidationFunction,
	type GardenDragState,
} from '../state/gardenDragState'
import { dragState as genericDragState } from '../state/dragState'
import { get } from 'svelte/store'
import { dragManager, type DragManager } from '../../lib/dnd/drag-manager'

// Custom Error for Async Validation Failures
class AsyncValidationError extends Error {
	originalError: unknown
	constructor(message: string, originalError?: unknown) {
		super(message)
		this.name = 'AsyncValidationError'
		this.originalError = originalError
		Object.setPrototypeOf(this, AsyncValidationError.prototype)
	}
}

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
	asyncValidation?: GardenAsyncValidationFunction
	onAsyncValidationStart?: () => void
	onAsyncValidationSuccess?: () => void
	onAsyncValidationError?: (errorMessage: string) => void
}

let {
	garden,
	onMovePlantInBed,
	onMovePlantToDifferentBed,
	onAddNewPlant,
	onDeletePlant,
	edgeIndicators,
	asyncValidation = defaultAsyncValidation as GardenAsyncValidationFunction,
	onAsyncValidationStart,
	onAsyncValidationSuccess,
	onAsyncValidationError,
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
		await handleAsyncPlantRemoval(
			currentDragStateVal.draggedExistingItem.id,
			currentDragStateVal.sourceZoneId,
			currentDragStateVal.draggedExistingItem.itemData as GardenItem,
		)
	} else if (
		currentDragStateVal.targetType === 'drop-zone' &&
		currentDragStateVal.targetZoneId &&
		currentDragStateVal.highlightedCell // Ensure we have a cell to drop on
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
				const gardenExistingItem = existingItem as ExistingGardenItem // Assert type
				await handleAsyncPlantCloning(
					sourceBedId,
					targetBedId,
					gardenExistingItem.itemData, // No cast needed now
					gardenExistingItem.x, // Now number
					gardenExistingItem.y, // Now number
					targetX,
					targetY,
				)
			} else {
				// This covers both intra-bed move and cross-bed move
				console.log(
					`[GardenView] MOVE operation detected. Source: ${sourceBedId}, Target: ${targetBedId}`,
				)
				await handleAsyncPlantPlacement(
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
			await handleAsyncPlantPlacement(
				targetBedId,
				currentDragStateVal.draggedNewItem as GardenItem,
				targetX,
				targetY,
				// No originalInstanceId or sourceZoneId for new items from toolbar
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

async function handleAsyncPlantPlacement(
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

	const sourceBedData = sourceZoneId ? beds.find((b) => b.id === sourceZoneId) : undefined
	const targetBedData = beds.find((b) => b.id === targetZoneId)
	let originalItemInSource: ExistingGardenItem | undefined = undefined
	if (sourceBedData && originalInstanceId) {
		const originalPp = sourceBedData.plantPlacements.find(
			(p) => p.id === originalInstanceId,
		)
		if (originalPp) originalItemInSource = plantPlacementToExistingGardenItem(originalPp)
	}

	let operationType: GenericOperationType = 'item-add-to-zone' // Default
	if (originalInstanceId && sourceZoneId) {
		operationType =
			sourceZoneId === targetZoneId ? 'item-move-within-zone' : 'item-move-across-zones'
	}

	const baseValidationContext: Partial<GardenValidationContext> = {
		item: itemData,
		targetZoneId: targetZoneId,
		targetX: x,
		targetY: y,
		operationType: operationType,
		applicationContext: { garden },
	}
	if (targetBedData) {
		baseValidationContext.targetZoneContext = {
			...targetBedData,
			plantPlacements: targetBedData.plantPlacements.map(
				plantPlacementToExistingGardenItem,
			),
		} as GardenZoneContext
	}
	if (originalInstanceId) baseValidationContext.itemInstanceId = originalInstanceId
	if (sourceZoneId) baseValidationContext.sourceZoneId = sourceZoneId
	if (sourceBedData)
		baseValidationContext.sourceZoneContext = {
			...sourceBedData,
			plantPlacements: sourceBedData.plantPlacements.map(
				plantPlacementToExistingGardenItem,
			),
		} as GardenZoneContext
	if (originalItemInSource) {
		baseValidationContext.sourceX = originalItemInSource.x
		baseValidationContext.sourceY = originalItemInSource.y
	}

	const validationContext = baseValidationContext as GardenValidationContext

	try {
		console.log(
			'[GardenView] Placement: try block entered. Context:',
			JSON.stringify(validationContext, null, 2),
		)
		try {
			onAsyncValidationStart?.()
			await asyncValidation(validationContext)
			onAsyncValidationSuccess?.()
		} catch (validationError) {
			const message =
				validationError instanceof Error
					? validationError.message
					: String(validationError)
			onAsyncValidationError?.(message)
			throw new AsyncValidationError(
				'asyncValidation function rejected or threw an error',
				validationError,
			)
		}
		console.log('[GardenView] Placement: asyncValidation SUCCEEDED.')
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			if (originalInstanceId && sourceZoneId) {
				if (sourceZoneId === targetZoneId) {
					onMovePlantInBed(targetZoneId, originalInstanceId, x, y)
				} else {
					if (originalItemInSource)
						onMovePlantToDifferentBed(
							sourceZoneId,
							targetZoneId,
							originalItemInSource,
							x,
							y,
						)
				}
			} else {
				onAddNewPlant(targetZoneId, itemData, x, y)
			}
		}, 1500)
	} catch (error: unknown) {
		if (error instanceof AsyncValidationError) {
			console.error(
				'[GardenView] Placement: CATCH block. asyncValidation REJECTED:',
				error.message,
				'Original error:',
				error.originalError,
			)
		} else {
			console.error(
				'[GardenView] Placement: CATCH block. Error in surrounding logic:',
				error,
			)
		}
		console.error(
			'[GardenView] Placement: Failing validationContext was:',
			JSON.stringify(validationContext, null, 2),
		)
		updatePendingOperation(operationId, 'error')

		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handleAsyncPlantRemoval(
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

	const sourceBedData = beds.find((b) => b.id === sourceZoneId)
	let itemToRemovePp: PlantPlacement | undefined
	if (sourceBedData)
		itemToRemovePp = sourceBedData.plantPlacements.find((p) => p.id === instanceId)

	const baseValidationContext: Partial<GardenValidationContext> = {
		operationType: 'item-remove-from-zone',
		item: itemData,
		itemInstanceId: instanceId,
		sourceZoneId: sourceZoneId,
		applicationContext: { garden },
	}
	if (sourceBedData)
		baseValidationContext.sourceZoneContext = {
			...sourceBedData,
			plantPlacements: sourceBedData.plantPlacements.map(
				plantPlacementToExistingGardenItem,
			),
		} as GardenZoneContext
	if (itemToRemovePp) {
		baseValidationContext.sourceX = itemToRemovePp.x
		baseValidationContext.sourceY = itemToRemovePp.y
	}
	const validationContext = baseValidationContext as GardenValidationContext

	try {
		console.log(
			'[GardenView] Removal: try block entered. Context:',
			JSON.stringify(validationContext, null, 2),
		)
		try {
			onAsyncValidationStart?.()
			await asyncValidation(validationContext)
			onAsyncValidationSuccess?.()
		} catch (validationError) {
			const message =
				validationError instanceof Error
					? validationError.message
					: String(validationError)
			onAsyncValidationError?.(message)
			throw new AsyncValidationError(
				'asyncValidation function rejected or threw an error',
				validationError,
			)
		}
		console.log('[GardenView] Removal: asyncValidation SUCCEEDED.')
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			onDeletePlant(instanceId, sourceZoneId)
		}, 1500)
	} catch (error: unknown) {
		if (error instanceof AsyncValidationError) {
			console.error(
				'[GardenView] Removal: CATCH block. asyncValidation REJECTED:',
				error.message,
				'Original error:',
				error.originalError,
			)
		} else {
			console.error(
				'[GardenView] Removal: CATCH block. Error in surrounding logic:',
				error,
			)
		}
		console.error(
			'[GardenView] Removal: Failing validationContext was:',
			JSON.stringify(validationContext, null, 2),
		)
		updatePendingOperation(operationId, 'error')

		setTimeout(() => {
			removePendingOperation(operationId)
		}, 1500)
	}
}

async function handleAsyncPlantCloning(
	sourceOriginalZoneId: string,
	targetCloneZoneId: string,
	itemDataToClone: GardenItem,
	sourceOriginalX: number,
	sourceOriginalY: number,
	targetCloneX: number,
	targetCloneY: number,
) {
	console.log('[GardenView] handleAsyncPlantCloning called with:', {
		sourceOriginalZoneId,
		targetCloneZoneId,
		itemDataToClone,
		sourceOriginalX,
		sourceOriginalY,
		targetCloneX,
		targetCloneY,
	})
	const operationId = addPendingOperation<GardenItem>({
		type: 'placement', // Cloning results in a new placement
		zoneId: targetCloneZoneId,
		x: targetCloneX,
		y: targetCloneY,
		size: itemDataToClone.size ?? 1,
		item: itemDataToClone,
		state: 'pending',
	})

	const sourceBedData = beds.find((b) => b.id === sourceOriginalZoneId)
	const targetBedData = beds.find((b) => b.id === targetCloneZoneId)

	const baseValidationContext: Partial<GardenValidationContext> = {
		operationType: 'item-clone-in-zone',
		item: itemDataToClone,
		sourceZoneId: sourceOriginalZoneId,
		targetZoneId: targetCloneZoneId,
		sourceX: sourceOriginalX,
		sourceY: sourceOriginalY,
		targetX: targetCloneX,
		targetY: targetCloneY,
		applicationContext: { garden },
	}
	if (sourceBedData)
		baseValidationContext.sourceZoneContext = {
			...sourceBedData,
			plantPlacements: sourceBedData.plantPlacements.map(
				plantPlacementToExistingGardenItem,
			),
		} as GardenZoneContext
	if (targetBedData)
		baseValidationContext.targetZoneContext = {
			...targetBedData,
			plantPlacements: targetBedData.plantPlacements.map(
				plantPlacementToExistingGardenItem,
			),
		} as GardenZoneContext

	const validationContext = baseValidationContext as GardenValidationContext

	try {
		console.log(
			'[GardenView] Cloning: try block entered. Context:',
			JSON.stringify(validationContext, null, 2),
		)
		try {
			onAsyncValidationStart?.()
			await asyncValidation(validationContext)
			onAsyncValidationSuccess?.()
		} catch (validationError) {
			const message =
				validationError instanceof Error
					? validationError.message
					: String(validationError)
			onAsyncValidationError?.(message)
			throw new AsyncValidationError(
				'asyncValidation function rejected or threw an error',
				validationError,
			)
		}
		console.log('[GardenView] Cloning: asyncValidation SUCCEEDED.')
		updatePendingOperation(operationId, 'success')

		setTimeout(() => {
			removePendingOperation(operationId)
			const clonedCoreItem: GardenItem = {
				...itemDataToClone,
				id: `cloned-${itemDataToClone.id}-${Date.now()}`,
			}
			onAddNewPlant(targetCloneZoneId, clonedCoreItem, targetCloneX, targetCloneY)
		}, 1500)
	} catch (error: unknown) {
		if (error instanceof AsyncValidationError) {
			console.error(
				'[GardenView] Cloning: CATCH block. asyncValidation REJECTED:',
				error.message,
				'Original error:',
				error.originalError,
			)
		} else {
			console.error(
				'[GardenView] Cloning: CATCH block. Error in surrounding logic:',
				error,
			)
		}
		console.error(
			'[GardenView] Cloning: Failing validationContext was:',
			JSON.stringify(validationContext, null, 2),
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
