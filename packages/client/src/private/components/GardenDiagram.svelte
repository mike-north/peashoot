<script lang="ts">
import GardenView from './GardenPresentation.svelte'
import type { GardenBed } from '../../lib/entities/garden-bed'
import {
	categoryNameForPlant,
	isPlant,
	tileSizeForPlant,
	type Plant,
} from '../../lib/entities/plant'
import type { Garden } from '../../lib/entities/garden'
import { findBed, findPlantPlacement } from '../../lib/entities/garden'
import {
	type ExistingGardenItem,
	type GardenValidationContext,
	type GardenAsyncValidationFunction,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
	type GardenZoneContext,
} from '../../private/state/gardenDragState'
import { GardenValidationService } from '../services/gardenValidationService'
import { plants, plantsReady } from '../../private/state/plantsStore'

import type { GridPlaceable, GridPlacement } from '../../private/grid/grid-placement'
import type { PlantWithSize } from '../../lib/entities/garden-bed'
import {
	updatePendingOperation,
	removePendingOperation,
} from '../../private/dnd/validation'
import { OPERATION_COMPLETION_DISPLAY_DURATION_MS } from '../../private/dnd/constants'
import type { DraggableItem } from '../dnd'
import {
	removeNotificationByMessage,
	showError,
	showInfo,
} from '../state/notificationsStore'

interface GardenDiagramProps {
	handleAddNewPlant: (bedId: string, item: Plant, x: number, y: number) => void
	handleMovePlantInBed: (
		bedId: string,
		plantId: string,
		newX: number,
		newY: number,
	) => void
	movePlantBetweenBeds: (
		garden: Garden,
		sourceBedId: string,
		targetBedId: string,
		placement: GridPlacement<GridPlaceable>,
		newX: number,
		newY: number,
	) => void
	garden: Garden
}

const {
	garden,
	movePlantBetweenBeds,
	handleAddNewPlant,
	handleMovePlantInBed,
}: GardenDiagramProps = $props()

// Create validation service instance
let validationService: GardenValidationService | undefined = $state<
	GardenValidationService | undefined
>(undefined)
let customAsyncValidation: GardenAsyncValidationFunction<PlantWithSize> | undefined =
	$state<GardenAsyncValidationFunction<PlantWithSize> | undefined>(undefined)

// Watch for plants to be ready and initialize validation service
$effect(() => {
	if ($plantsReady && $plants.length > 0 && !validationService) {
		console.log('Initializing validation service with', $plants.length, 'plants')
		validationService = new GardenValidationService($plants)
		customAsyncValidation = validationService.createAsyncValidator()
	}
})

function handleAsyncValidationStart() {
	showInfo('Validating...', { autoRemove: false })
}

function handleAsyncValidationSuccess() {
	// Remove the validation message when validation succeeds
	removeNotificationByMessage('Validating...')
}

function handleAsyncValidationError(errorMessage: string) {
	// Remove the validation message and show error
	removeNotificationByMessage('Validating...')
	showError(errorMessage)
}

function handleMovePlantToDifferentBed(
	sourceBedId: string,
	targetBedId: string,
	existingItem: ExistingGardenItem<GridPlaceable>,
	newX: number,
	newY: number,
) {
	// Inline conversion from ExistingGardenItem<PlantWithSize> to GridPlacement<PlantWithSize>
	const gridPlacementArg: GridPlacement<GridPlaceable> = {
		id: existingItem.id,
		x: existingItem.x,
		y: existingItem.y,
		size: tileSizeForItem(existingItem.item),
		item: existingItem.item,
		sourceZoneId: existingItem.sourceZoneId,
	}
	movePlantBetweenBeds(garden, sourceBedId, targetBedId, gridPlacementArg, newX, newY)
}

function handleDeletePlant(plantId: string, bedId: string) {
	const bed = garden.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		garden.beds = garden.beds.map((b: GardenBed) =>
			b.id === bedId
				? { ...b, placements: b.placements.filter((p) => p.id !== plantId) }
				: b,
		)

		console.log(`[Garden] Deleted plant ${plantId} from bed ${bedId}`)
	} else {
		console.error('[Garden] Bed not found for deletePlant:', bedId)
	}
}

function buildGardenZoneContext(
	bed: GardenBed | undefined,
): GardenZoneContext<PlantWithSize> | undefined {
	if (!bed) return undefined
	return {
		...bed,
		placements: bed.placements.map((placement) => {
			// placement is already GridPlacement<PlantWithSize>
			return placement
		}),
	} as GardenZoneContext<PlantWithSize>
}

async function handleRequestPlacement(
	details: PlacementRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	if (!isPlant(details.itemData)) throw new Error('Item is not a plant')

	handleAsyncValidationStart()

	const targetBed = findBed(garden, details.targetZoneId)
	const sourceBed = details.sourceZoneId
		? findBed(garden, details.sourceZoneId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext<GridPlaceable>> = {
		item: details.itemData,
		targetZoneId: details.targetZoneId,
		targetX: details.x,
		targetY: details.y,
		operationType: details.operationType,
		applicationContext: { garden: garden },
	}

	const targetCtx = buildGardenZoneContext(targetBed)
	if (targetCtx) baseValidationContext.targetZoneContext = targetCtx
	if (details.originalInstanceId)
		baseValidationContext.itemInstanceId = details.originalInstanceId
	if (details.sourceZoneId) baseValidationContext.sourceZoneId = details.sourceZoneId
	const sourceCtx = buildGardenZoneContext(sourceBed)
	if (sourceCtx) baseValidationContext.sourceZoneContext = sourceCtx

	if (details.originalInstanceId && sourceBed) {
		const originalPlantPlacement = findPlantPlacement(
			sourceBed,
			details.originalInstanceId,
		)
		if (originalPlantPlacement) {
			baseValidationContext.sourceX = originalPlantPlacement.x
			baseValidationContext.sourceY = originalPlantPlacement.y
		}
	}

	const validationContext =
		baseValidationContext as GardenValidationContext<PlantWithSize>

	try {
		if (!customAsyncValidation) {
			throw new Error('Validation service not ready - plants still loading')
		}
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			const item = details.itemData
			if (!isPlant(item)) throw new Error('Item is not a plant')
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual operation
			if (
				details.operationType === 'item-move-within-zone' &&
				details.originalInstanceId
			) {
				handleMovePlantInBed(
					details.targetZoneId,
					details.originalInstanceId,
					details.x,
					details.y,
				)
			} else if (
				details.operationType === 'item-move-across-zones' &&
				details.originalInstanceId &&
				details.sourceZoneId &&
				baseValidationContext.sourceX !== undefined &&
				baseValidationContext.sourceY !== undefined
			) {
				const existingItem: ExistingGardenItem<GridPlaceable> = {
					id: details.originalInstanceId,
					x: baseValidationContext.sourceX,
					y: baseValidationContext.sourceY,
					item: details.itemData,
					size: tileSizeForItem(details.itemData),
					sourceZoneId: details.sourceZoneId,
				}
				handleMovePlantToDifferentBed(
					details.sourceZoneId,
					details.targetZoneId,
					existingItem,
					details.x,
					details.y,
				)
			} else if (details.operationType === 'item-add-to-zone') {
				handleAddNewPlant(details.targetZoneId, item, details.x, details.y)
			}
			// Update pending operation to success
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'success')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		} else {
			// Validation failed - show error but don't perform operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during placement request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

async function handleRequestRemoval(
	details: RemovalRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	if (!isPlant(details.itemData)) {
		throw new Error('Item is not a plant')
	}

	handleAsyncValidationStart()

	const sourceBed = findBed(garden, details.sourceZoneId)
	const plantToRemove = sourceBed
		? findPlantPlacement(sourceBed, details.instanceId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext<GridPlaceable>> = {
		operationType: 'item-remove-from-zone',
		item: details.itemData,
		itemInstanceId: details.instanceId,
		sourceZoneId: details.sourceZoneId,
		applicationContext: { garden: garden },
	}
	const remSourceCtx = buildGardenZoneContext(sourceBed)
	if (remSourceCtx) baseValidationContext.sourceZoneContext = remSourceCtx
	if (plantToRemove) {
		baseValidationContext.sourceX = plantToRemove.x
		baseValidationContext.sourceY = plantToRemove.y
	}

	const validationContext = baseValidationContext as GardenValidationContext<Plant>
	// console.log('[GardenDiagram] handleRequestRemoval - validationContext:', JSON.stringify(validationContext, null, 2));

	try {
		if (!customAsyncValidation) {
			// console.error('[GardenDiagram] handleRequestRemoval - customAsyncValidation not ready');
			throw new Error('Validation service not ready - plants still loading')
		}
		const result = await customAsyncValidation(validationContext)
		// console.log('[GardenDiagram] handleRequestRemoval - validation result:', result);
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual removal
			handleDeletePlant(details.instanceId, details.sourceZoneId)
			// Update pending operation to success
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'success')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		} else {
			// Validation failed - show error but don't perform operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during removal request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

async function handleRequestCloning(
	details: CloningRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	if (!isPlant(details.itemDataToClone)) throw new Error('Item is not a plant')
	handleAsyncValidationStart()

	const sourceBed = findBed(garden, details.sourceOriginalZoneId)
	const targetBed = findBed(garden, details.targetCloneZoneId)

	const baseValidationContext: Partial<GardenValidationContext<GridPlaceable>> = {
		operationType: 'item-clone-in-zone',
		item: details.itemDataToClone,
		sourceZoneId: details.sourceOriginalZoneId,
		targetZoneId: details.targetCloneZoneId,
		sourceX: details.sourceOriginalX,
		sourceY: details.sourceOriginalY,
		targetX: details.targetCloneX,
		targetY: details.targetCloneY,
		applicationContext: { garden: garden },
	}
	const cloneSourceCtx = buildGardenZoneContext(sourceBed)
	if (cloneSourceCtx) baseValidationContext.sourceZoneContext = cloneSourceCtx
	const cloneTargetCtx = buildGardenZoneContext(targetBed)
	if (cloneTargetCtx) baseValidationContext.targetZoneContext = cloneTargetCtx

	const validationContext = baseValidationContext as GardenValidationContext<Plant>

	try {
		if (!customAsyncValidation) {
			throw new Error('Validation service not ready - plants still loading')
		}
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual clone
			handleAddNewPlant(
				details.targetCloneZoneId,
				details.itemDataToClone,
				details.targetCloneX,
				details.targetCloneY,
			)
			// Update pending operation to success
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'success')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		} else {
			// Validation failed - show error but don't perform operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during cloning request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

function tileSizeForItem(item: DraggableItem): number {
	if (!isPlant(item)) throw new Error('Item is not a plant')
	return tileSizeForPlant(item)
}

function categoryNameForItem(item: DraggableItem): string {
	if (!isPlant(item)) throw new Error('Item is not a plant')
	return categoryNameForPlant(item)
}
</script>

{#if garden}
	<GardenView
		garden={garden}
		edgeIndicators={garden.edgeIndicators}
		onRequestPlacement={handleRequestPlacement}
		onRequestRemoval={handleRequestRemoval}
		onRequestCloning={handleRequestCloning}
		tileSizeForItem={tileSizeForItem}
		categoryNameForItem={categoryNameForItem}
	/>
{:else}
	<div class="flex justify-center items-center h-full p-8">
		<span class="loading loading-ring loading-xl"></span>
		<div class="text-md font-bold">Loading garden...</div>
	</div>
{/if}
