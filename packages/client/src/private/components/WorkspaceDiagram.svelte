<script lang="ts">
import WorkspacePresentation from './WorkspacePresentation.svelte'
import type { Zone } from '../../lib/entities/zone'
import type { Workspace } from '../../lib/entities/workspace'
import { findZone, findItemPlacement } from '../../lib/entities/workspace'
import {
	type ExistingWorkspaceItem,
	type WorkspaceValidationContext,
	type WorkspaceAsyncValidationFunction,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
	type WorkspaceZoneContext,
} from '../../private/state/workspaceDragState'
import { WorkspaceValidationService } from '../services/workspaceValidationService'
import { plants, plantsReady } from '../../private/state/plantsStore'
import type { GridPlaceable, GridPlacement } from '../../private/grid/grid-placement'
import type { ItemWithSize } from '../../lib/entities/zone'
import type { ItemAdapter } from '../../lib/adapters/item-adapter'
import type { PlantItem } from '../../lib/item-types/plant-item'
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

interface WorkspaceDiagramProps<TItem extends GridPlaceable> {
	handleAddNewItem: (zoneId: string, item: TItem, x: number, y: number) => void
	handleMoveItemInZone: (
		zoneId: string,
		itemId: string,
		newX: number,
		newY: number,
	) => void
	handleDeleteItem: (zoneId: string, itemId: string) => void
	moveItemBetweenZones: (
		workspace: Workspace,
		sourceZoneId: string,
		targetZoneId: string,
		placement: GridPlacement<PlantItem>,
		newX: number,
		newY: number,
	) => void
	workspace: Workspace
	itemAdapter: ItemAdapter<TItem>
}

const {
	workspace,
	moveItemBetweenZones,
	handleAddNewItem,
	handleMoveItemInZone,
	handleDeleteItem,
	itemAdapter,
}: WorkspaceDiagramProps<PlantItem> = $props()

// Create validation service instance
let validationService: WorkspaceValidationService | undefined = $state<
	WorkspaceValidationService | undefined
>(undefined)
let customAsyncValidation: WorkspaceAsyncValidationFunction<ItemWithSize> | undefined =
	$state<WorkspaceAsyncValidationFunction<ItemWithSize> | undefined>(undefined)

// Watch for plants to be ready and initialize validation service
$effect(() => {
	if ($plantsReady && $plants.length > 0 && !validationService) {
		console.log('Initializing validation service with', $plants.length, 'items')
		validationService = new WorkspaceValidationService($plants)
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

function handleMoveItemToDifferentZone(
	sourceZoneId: string,
	targetZoneId: string,
	existingItem: ExistingWorkspaceItem<PlantItem>,
	newX: number,
	newY: number,
) {
	// Inline conversion from ExistingWorkspaceItem<ItemWithSize> to GridPlacement<ItemWithSize>
	const gridPlacementArg: GridPlacement<PlantItem> = {
		id: existingItem.id,
		x: existingItem.x,
		y: existingItem.y,
		size: itemAdapter.getItemSize(existingItem.item),
		item: existingItem.item,
		sourceZoneId: existingItem.sourceZoneId,
	}
	moveItemBetweenZones(
		workspace,
		sourceZoneId,
		targetZoneId,
		gridPlacementArg,
		newX,
		newY,
	)
}

function performDeleteItem(itemId: string, zoneId: string) {
	// Delegate to parent component's callback instead of mutating the workspace prop
	handleDeleteItem(zoneId, itemId)
	console.log(`[Workspace] Requested deletion of item ${itemId} from zone ${zoneId}`)
}

function buildWorkspaceZoneContext(
	zone: Zone | undefined,
): WorkspaceZoneContext<ItemWithSize> | undefined {
	if (!zone) return undefined
	return {
		...zone,
		placements: zone.placements.map((placement) => {
			// placement is already GridPlacement<ItemWithSize>
			return placement
		}),
	} as WorkspaceZoneContext<ItemWithSize>
}

async function handleRequestPlacement(
	details: PlacementRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	if (!itemAdapter.isValidItem(details.itemData))
		throw new Error('Item is not valid for this adapter')

	handleAsyncValidationStart()

	const targetZone = findZone(workspace, details.targetZoneId)
	const sourceZone = details.sourceZoneId
		? findZone(workspace, details.sourceZoneId)
		: undefined

	const baseValidationContext: Partial<WorkspaceValidationContext<PlantItem>> = {
		item: details.itemData,
		targetZoneId: details.targetZoneId,
		targetX: details.x,
		targetY: details.y,
		operationType: details.operationType,
		applicationContext: { workspace: workspace },
	}

	const targetCtx = buildWorkspaceZoneContext(targetZone)
	if (targetCtx)
		baseValidationContext.targetZoneContext = targetCtx as WorkspaceZoneContext<PlantItem>
	if (details.originalInstanceId)
		baseValidationContext.itemInstanceId = details.originalInstanceId
	if (details.sourceZoneId) baseValidationContext.sourceZoneId = details.sourceZoneId
	const sourceCtx = buildWorkspaceZoneContext(sourceZone)
	if (sourceCtx)
		baseValidationContext.sourceZoneContext = sourceCtx as WorkspaceZoneContext<PlantItem>

	if (details.originalInstanceId && sourceZone) {
		const originalItemPlacement = findItemPlacement(
			sourceZone,
			details.originalInstanceId,
		)
		if (originalItemPlacement) {
			baseValidationContext.sourceX = originalItemPlacement.x
			baseValidationContext.sourceY = originalItemPlacement.y
		}
	}

	const validationContext = baseValidationContext as WorkspaceValidationContext<PlantItem>

	try {
		if (!customAsyncValidation) {
			throw new Error('Validation service not ready - items still loading')
		}
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			const item = details.itemData
			if (!itemAdapter.isValidItem(item))
				throw new Error('Item is not valid for this adapter')
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual operation
			if (
				details.operationType === 'item-move-within-zone' &&
				details.originalInstanceId
			) {
				handleMoveItemInZone(
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
				const existingItem: ExistingWorkspaceItem<PlantItem> = {
					id: details.originalInstanceId,
					x: baseValidationContext.sourceX,
					y: baseValidationContext.sourceY,
					item: details.itemData,
					size: itemAdapter.getItemSize(details.itemData),
					sourceZoneId: details.sourceZoneId,
				}
				handleMoveItemToDifferentZone(
					details.sourceZoneId,
					details.targetZoneId,
					existingItem,
					details.x,
					details.y,
				)
			} else if (details.operationType === 'item-add-to-zone') {
				handleAddNewItem(details.targetZoneId, item, details.x, details.y)
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
			'[WorkspacePage] Validation system failure during placement request:',
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
	if (!itemAdapter.isValidItem(details.itemData)) {
		throw new Error('Item is not valid for this adapter')
	}

	handleAsyncValidationStart()

	const sourceZone = findZone(workspace, details.sourceZoneId)
	const itemToRemove = sourceZone
		? findItemPlacement(sourceZone, details.instanceId)
		: undefined

	const baseValidationContext: Partial<WorkspaceValidationContext<PlantItem>> = {
		operationType: 'item-remove-from-zone',
		item: details.itemData,
		itemInstanceId: details.instanceId,
		sourceZoneId: details.sourceZoneId,
		applicationContext: { workspace: workspace },
	}
	const remSourceCtx = buildWorkspaceZoneContext(sourceZone)
	if (remSourceCtx)
		baseValidationContext.sourceZoneContext =
			remSourceCtx as WorkspaceZoneContext<PlantItem>
	if (itemToRemove) {
		baseValidationContext.sourceX = itemToRemove.x
		baseValidationContext.sourceY = itemToRemove.y
	}

	const validationContext = baseValidationContext as WorkspaceValidationContext<PlantItem>

	try {
		if (!customAsyncValidation) {
			throw new Error('Validation service not ready - items still loading')
		}
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual removal
			performDeleteItem(details.instanceId, details.sourceZoneId)
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
			'[WorkspacePage] Validation system failure during removal request:',
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
	if (!itemAdapter.isValidItem(details.itemDataToClone))
		throw new Error('Item is not valid for this adapter')
	handleAsyncValidationStart()

	const sourceZone = findZone(workspace, details.sourceOriginalZoneId)
	const targetZone = findZone(workspace, details.targetCloneZoneId)

	const baseValidationContext: Partial<WorkspaceValidationContext<PlantItem>> = {
		operationType: 'item-clone-in-zone',
		item: details.itemDataToClone,
		sourceZoneId: details.sourceOriginalZoneId,
		targetZoneId: details.targetCloneZoneId,
		sourceX: details.sourceOriginalX,
		sourceY: details.sourceOriginalY,
		targetX: details.targetCloneX,
		targetY: details.targetCloneY,
		applicationContext: { workspace: workspace },
	}
	const cloneSourceCtx = buildWorkspaceZoneContext(sourceZone)
	if (cloneSourceCtx)
		baseValidationContext.sourceZoneContext =
			cloneSourceCtx as WorkspaceZoneContext<PlantItem>
	const cloneTargetCtx = buildWorkspaceZoneContext(targetZone)
	if (cloneTargetCtx)
		baseValidationContext.targetZoneContext =
			cloneTargetCtx as WorkspaceZoneContext<PlantItem>

	const validationContext = baseValidationContext as WorkspaceValidationContext<PlantItem>

	try {
		if (!customAsyncValidation) {
			throw new Error('Validation service not ready - items still loading')
		}
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual clone
			handleAddNewItem(
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
			'[WorkspacePage] Validation system failure during cloning request:',
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
	if (!itemAdapter.isValidItem(item))
		throw new Error('Item is not valid for this adapter')
	return itemAdapter.getItemSize(item)
}

function categoryNameForItem(item: DraggableItem): string {
	if (!itemAdapter.isValidItem(item))
		throw new Error('Item is not valid for this adapter')
	return itemAdapter.getCategoryName(item)
}
</script>

{#if workspace}
	<WorkspacePresentation
		workspace={workspace}
		onRequestPlacement={handleRequestPlacement}
		onRequestRemoval={handleRequestRemoval}
		onRequestCloning={handleRequestCloning}
		tileSizeForItem={tileSizeForItem}
		categoryNameForItem={categoryNameForItem}
	/>
{:else}
	<div class="flex justify-center items-center h-full p-8">
		<span class="loading loading-ring loading-xl"></span>
		<div class="text-md font-bold">Loading workspace...</div>
	</div>
{/if}
