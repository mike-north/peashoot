<script lang="ts">
import WorkspacePresentation from './WorkspacePresentation.svelte'
import type { Workspace } from '../../lib/entities/workspace'
import { findZone, findItemPlacement } from '../../lib/entities/workspace'
import {
	type ExistingWorkspaceItem,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
} from '../../private/state/workspaceDragState'
import type { GridPlaceable, GridPlacement } from '../../private/grid/grid-placement'
import type { ItemAdapter } from '../../lib/adapters/item-adapter'
import { isPlantItem, type PlantItem } from '../../lib/item-types/plant-item'
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
import type {
	ValidationResult,
	WorkspaceController,
} from '../../lib/controllers/WorkspaceController'
import type { ItemWithSize } from '../../lib/entities/zone'
import type { Item } from '../../lib/entities/item'

interface WorkspaceDiagramProps<TItem extends GridPlaceable & ItemWithSize> {
	handleAddNewItem: (zoneId: string, item: TItem, x: number, y: number) => Promise<void>
	handleMoveItemInZone: (
		zoneId: string,
		itemId: string,
		newX: number,
		newY: number,
	) => Promise<void>
	handleDeleteItem: (zoneId: string, itemId: string) => Promise<void>
	moveItemBetweenZones: (
		workspace: Workspace,
		sourceZoneId: string,
		targetZoneId: string,
		placement: GridPlacement<TItem>,
		newX: number,
		newY: number,
	) => Promise<void>
	workspace: Workspace
	itemAdapter: ItemAdapter<TItem>
	controller: WorkspaceController<TItem>
}

const {
	workspace,
	moveItemBetweenZones,
	handleAddNewItem,
	handleMoveItemInZone,
	handleDeleteItem,
	itemAdapter,
	controller,
}: WorkspaceDiagramProps<Item> = $props()

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

async function handleMoveItemToDifferentZone(
	sourceZoneId: string,
	targetZoneId: string,
	existingItem: ExistingWorkspaceItem<PlantItem>,
	newX: number,
	newY: number,
) {
	// Get the zone objects from IDs
	const sourceZone = workspace.zones.find((z) => z.id === sourceZoneId)
	const targetZone = workspace.zones.find((z) => z.id === targetZoneId)

	if (!sourceZone || !targetZone) {
		handleAsyncValidationError('Source or target zone not found')
		return
	}

	// Check if dragging across zones is enabled
	if (!controller.isFeatureEnabled('canDragItemsAcrossZones')) {
		handleAsyncValidationError('Moving items between zones is currently disabled')
		return
	}

	// Validate the move with controller
	const validationResult = await controller.validateItemMove(
		workspace,
		existingItem.item,
		sourceZone,
		targetZone,
		newX,
		newY,
		existingItem.id,
	)

	if (!validationResult.isValid) {
		handleAsyncValidationError(validationResult.reason || 'Unknown validation error')
		return
	}

	// Inline conversion from ExistingWorkspaceItem<ItemWithSize> to GridPlacement<ItemWithSize>
	const gridPlacementArg: GridPlacement<PlantItem> = {
		id: existingItem.id,
		x: existingItem.x,
		y: existingItem.y,
		size: itemAdapter.getItemSize(existingItem.item),
		item: existingItem.item,
		sourceZoneId: existingItem.sourceZoneId,
	}
	await moveItemBetweenZones(
		workspace,
		sourceZoneId,
		targetZoneId,
		gridPlacementArg,
		newX,
		newY,
	)
}

async function performDeleteItem(itemId: string, zoneId: string): Promise<void> {
	// Get the zone object from ID
	const zone = workspace.zones.find((z) => z.id === zoneId)
	if (!zone) {
		handleAsyncValidationError('Zone not found')
		return
	}

	// Get the item from the zone
	const item = zone.placements.find((p) => p.id === itemId)?.item
	if (!item) {
		handleAsyncValidationError('Item not found')
		return
	}

	// Check if item removal is enabled
	if (!controller.isFeatureEnabled('canRemoveItems')) {
		handleAsyncValidationError('Removing items is currently disabled')
		return
	}

	// Validate removal with the controller
	const validationResult = await controller.validateItemRemoval(
		workspace,
		item,
		zone,
		itemId,
	)

	if (!validationResult.isValid) {
		handleAsyncValidationError(validationResult.reason || 'Unknown validation error')
		return
	}

	// Delegate to parent component's callback instead of mutating the workspace prop
	await handleDeleteItem(zoneId, itemId)
	console.log(`[Workspace] Requested deletion of item ${itemId} from zone ${zoneId}`)
}

async function handleRequestPlacement(
	details: PlacementRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	// First ensure the item data is valid before any operations
	let validatedItem: PlantItem
	try {
		const rawValidatedItem = itemAdapter.validateAndCastItem(details.itemData)
		if (isPlantItem(rawValidatedItem)) {
			validatedItem = rawValidatedItem
		} else {
			throw new Error('Item is not a plant item')
		}
	} catch (error) {
		console.error('Invalid item data in placement request', {
			error,
			itemData: details.itemData,
			operationType: details.operationType,
		})
		handleAsyncValidationError(
			'Item validation failed: ' +
				(error instanceof Error ? error.message : String(error)),
		)
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	handleAsyncValidationStart()

	// Find the zones
	const targetZone = findZone(workspace, details.targetZoneId)
	const sourceZone = details.sourceZoneId
		? findZone(workspace, details.sourceZoneId)
		: undefined

	if (!targetZone) {
		handleAsyncValidationError('Target zone not found')
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	try {
		// First check feature enablement based on operation type
		if (
			details.operationType === 'item-move-within-zone' &&
			!controller.isFeatureEnabled('canDragItemsWithinZone')
		) {
			throw new Error('Moving items within zones is currently disabled')
		} else if (
			details.operationType === 'item-move-across-zones' &&
			!controller.isFeatureEnabled('canDragItemsAcrossZones')
		) {
			throw new Error('Moving items between zones is currently disabled')
		} else if (
			details.operationType === 'item-add-to-zone' &&
			!controller.isFeatureEnabled('canAddItems')
		) {
			throw new Error('Adding new items is currently disabled')
		}

		// Validate with controller - use the validated item, not the original
		let validationResult: ValidationResult

		if (details.operationType === 'item-move-within-zone' && details.originalInstanceId) {
			validationResult = await controller.validateItemPlacement(
				workspace,
				validatedItem,
				targetZone,
				details.x,
				details.y,
				details.originalInstanceId,
			)
		} else if (
			details.operationType === 'item-move-across-zones' &&
			details.originalInstanceId &&
			details.sourceZoneId &&
			sourceZone
		) {
			validationResult = await controller.validateItemMove(
				workspace,
				validatedItem,
				sourceZone,
				targetZone,
				details.x,
				details.y,
				details.originalInstanceId,
			)
		} else if (details.operationType === 'item-add-to-zone') {
			validationResult = await controller.validateItemPlacement(
				workspace,
				validatedItem,
				targetZone,
				details.x,
				details.y,
			)
		} else {
			throw new Error(`Unsupported operation type: ${details.operationType}`)
		}

		if (validationResult.isValid) {
			handleAsyncValidationSuccess()

			// Validation passed - perform the actual operation with the validated item
			if (
				details.operationType === 'item-move-within-zone' &&
				details.originalInstanceId
			) {
				await handleMoveItemInZone(
					details.targetZoneId,
					details.originalInstanceId,
					details.x,
					details.y,
				)
			} else if (
				details.operationType === 'item-move-across-zones' &&
				details.originalInstanceId &&
				details.sourceZoneId
			) {
				// Find original item coordinates
				const originalItem = sourceZone?.placements.find(
					(p) => p.id === details.originalInstanceId,
				)

				if (!originalItem) {
					throw new Error('Original item not found')
				}

				const existingItem: ExistingWorkspaceItem<PlantItem> = {
					id: details.originalInstanceId,
					x: originalItem.x,
					y: originalItem.y,
					item: validatedItem, // Use the validated item here!
					size: itemAdapter.getItemSize(validatedItem),
					sourceZoneId: details.sourceZoneId,
				}

				await handleMoveItemToDifferentZone(
					details.sourceZoneId,
					details.targetZoneId,
					existingItem,
					details.x,
					details.y,
				)
			} else if (details.operationType === 'item-add-to-zone') {
				await handleAddNewItem(details.targetZoneId, validatedItem, details.x, details.y)
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
			handleAsyncValidationError(validationResult.reason || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure or feature disabled
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[WorkspacePage] Validation error during placement request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(errorMessage)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
	}
}

async function handleRequestRemoval(
	details: RemovalRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	// First ensure the item data is valid before any operations
	let validatedItem: PlantItem
	try {
		const rawValidatedItem = itemAdapter.validateAndCastItem(details.itemData)
		if (isPlantItem(rawValidatedItem)) {
			validatedItem = rawValidatedItem
		} else {
			throw new Error('Item is not a plant item')
		}
	} catch (error) {
		console.error('Invalid item data in removal request', {
			error,
			itemData: details.itemData,
		})
		handleAsyncValidationError(
			'Item validation failed: ' +
				(error instanceof Error ? error.message : String(error)),
		)
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	handleAsyncValidationStart()

	const sourceZone = findZone(workspace, details.sourceZoneId)
	if (!sourceZone) {
		handleAsyncValidationError('Source zone not found')
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	const itemToRemove = findItemPlacement(sourceZone, details.instanceId)
	if (!itemToRemove) {
		handleAsyncValidationError('Item to remove not found')
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	try {
		// Check if removing items is enabled
		if (!controller.isFeatureEnabled('canRemoveItems')) {
			throw new Error('Removing items is currently disabled')
		}

		// Validate with controller
		const validationResult = await controller.validateItemRemoval(
			workspace,
			validatedItem,
			sourceZone,
			details.instanceId,
		)

		if (validationResult.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual removal
			await performDeleteItem(details.instanceId, details.sourceZoneId)
			// Update pending operation to success
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'success')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		} else {
			// Validation failed - show error but don't perform operation
			handleAsyncValidationError(validationResult.reason || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure or feature disabled
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[WorkspacePage] Validation error during removal request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(errorMessage)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
	}
}

async function handleRequestCloning(
	details: CloningRequestDetails<DraggableItem>,
	pendingOpId?: string,
): Promise<void> {
	// First ensure the item data is valid before any operations
	let validatedItem: PlantItem
	try {
		const rawValidatedItem = itemAdapter.validateAndCastItem(details.itemDataToClone)
		if (isPlantItem(rawValidatedItem)) {
			validatedItem = rawValidatedItem
		} else {
			throw new Error('Item is not a plant item')
		}
	} catch (error) {
		console.error('Invalid item data in cloning request', {
			error,
			itemData: details.itemDataToClone,
		})
		handleAsyncValidationError(
			'Item validation failed: ' +
				(error instanceof Error ? error.message : String(error)),
		)
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	handleAsyncValidationStart()

	// Find the target zone
	const targetZone = findZone(workspace, details.targetCloneZoneId)
	if (!targetZone) {
		handleAsyncValidationError('Target zone not found')
		updatePendingOperation(pendingOpId || '', 'error')
		setTimeout(() => {
			removePendingOperation(pendingOpId || '')
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		return
	}

	try {
		// Check if cloning items is enabled
		if (!controller.isFeatureEnabled('canCloneItems')) {
			throw new Error('Cloning items is currently disabled')
		}

		// Validate with controller - treat cloning like adding a new item
		const validationResult = await controller.validateItemPlacement(
			workspace,
			validatedItem,
			targetZone,
			details.targetCloneX,
			details.targetCloneY,
		)

		if (validationResult.isValid) {
			handleAsyncValidationSuccess()
			// Validation passed - perform the actual clone
			await handleAddNewItem(
				details.targetCloneZoneId,
				validatedItem,
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
			handleAsyncValidationError(validationResult.reason || 'Unknown validation error')
			// Update pending operation to error
			if (pendingOpId) {
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
			}
		}
	} catch (error) {
		// Validation system failure or feature disabled
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[WorkspacePage] Validation error during cloning request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(errorMessage)
		// Update pending operation to error
		if (pendingOpId) {
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
		}
	}
}

function tileSizeForItem(item: DraggableItem): number {
	try {
		// Log the item type for debugging
		console.debug('Validating item type', {
			item,
			itemType: typeof item,
			isObject: typeof item === 'object',
			hasId: typeof item === 'object' && 'id' in item,
			idValue:
				typeof item === 'object' && 'id' in item ? (item as { id: unknown }).id : null,
			hasMetadata: typeof item === 'object' && 'metadata' in item,
			category:
				typeof item === 'object' && 'category' in item
					? (item as { category: unknown }).category
					: null,
			size:
				typeof item === 'object' && 'size' in item
					? (item as { size: unknown }).size
					: null,
		})

		const validItem = itemAdapter.validateAndCastItem(item)
		console.debug('Item validation succeeded', { id: validItem.id })
		return itemAdapter.getItemSize(validItem)
	} catch (err) {
		console.error('Item validation failed', {
			err,
			item,
			itemType: typeof item,
			itemKeys: typeof item === 'object' ? Object.keys(item as object) : null,
		})
		throw new Error('Item is not valid for this adapter')
	}
}

function categoryNameForItem(item: DraggableItem): string {
	try {
		const validItem = itemAdapter.validateAndCastItem(item)
		return itemAdapter.getCategoryName(validItem)
	} catch (error: unknown) {
		console.error('Error getting category name for item', { item })
		throw new Error('Item is not valid for this adapter', { cause: error })
	}
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
