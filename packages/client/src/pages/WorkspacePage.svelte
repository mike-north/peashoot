<script lang="ts">
import WorkspaceDiagram, {
	type AddNewItemHandler,
	type MoveItemBetweenZonesHandler,
} from '../private/components/WorkspaceDiagram.svelte'
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import type { Workspace } from '@peashoot/types'
import type { IWorkspaceController } from '../lib/controllers/workspace-controller'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import {
	loadFirstGarden,
	currentGarden,
	moveItemWithinZone,
	moveItemBetweenZones,
	removePlantFromZone,
	clonePlant,
	addItemToWorkspace,
} from '../lib/state/workspaces.store'
import { ItemRepository } from '../lib/repositories/item.repository'
import type { Item, Zone } from '@peashoot/types'
import type { ExistingWorkspaceItem } from '../private/state/workspaceDragState'

const { route, controller }: { route: RouteResult; controller: IWorkspaceController } =
	$props()

// Create plant repository and workspace controller
const plantRepository = new ItemRepository()
const workspaceController = $derived(controller)

// Use the currentGarden store directly
const workspaceInstance = $derived($currentGarden || undefined)

onMount(() => {
	loadFirstGarden().catch((err: unknown) => {
		console.error('Error fetching garden', { cause: err })
	})
})

async function handleAddNewItem(zoneId: string, item: Item, x: number, y: number) {
	if (!workspaceInstance) {
		throw new Error('Attempt to add new item to undefined workspace')
	}

	// Check if adding items is enabled
	if (!workspaceController.isFeatureEnabled('canAddItems')) {
		console.warn('[Workspace] Adding items is currently disabled')
		throw new Error('Adding items is currently disabled')
	}

	// Get the zone object from ID
	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (!zone) {
		console.error('[WorkspacePage] Zone not found for addNewItem:', zoneId)
		throw new Error('Zone not found')
	}

	// Validate the placement
	const validationResult = await workspaceController.validateItemPlacement(
		workspaceInstance,
		item,
		zone,
		x,
		y,
	)

	if (!validationResult.isValid) {
		console.warn(`[Workspace] Add validation failed: ${validationResult.reason}`)
		throw new Error(validationResult.reason || 'Validation failed')
	}

	// Use the garden store method that will update the API and then the store
	const success = await addItemToWorkspace(workspaceInstance.id, zoneId, item, x, y)

	if (!success) {
		console.error('[WorkspacePage] Failed to add new item')
		throw new Error('Failed to add new item')
	}

	console.log(
		`[Workspace] Added new ${item.displayName} to zone ${zoneId} at (${x}, ${y})`,
	)
}

async function handleMoveItemInZone(
	zoneId: string,
	itemId: string,
	x: number,
	y: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to move item with undefined workspace')
	}

	// Check if moving items is enabled
	if (!workspaceController.isFeatureEnabled('canDragItemsWithinZone')) {
		console.warn('[Workspace] Moving items is currently disabled')
		throw new Error('Moving items is currently disabled')
	}

	// Use the garden store method that will update the API and then the store
	const success = await moveItemWithinZone(workspaceInstance.id, zoneId, itemId, x, y)

	if (!success) {
		console.error('[WorkspacePage] Failed to move item')
		throw new Error('Failed to move item')
	}

	console.log(
		`[WorkspacePage] Moved item ${itemId} to position (${x}, ${y}) in zone ${zoneId}`,
	)
}

async function handleMoveItemToDifferentZone(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: ExistingWorkspaceItem<Item>,
	x: number,
	y: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to move item with undefined workspace')
	}

	// Check if moving items is enabled
	if (!workspaceController.isFeatureEnabled('canDragItemsAcrossZones')) {
		console.warn('[Workspace] Moving items is currently disabled')
		throw new Error('Moving items is currently disabled')
	}

	// Use the garden store method that will update the API and then the store
	const success = await moveItemBetweenZones(
		workspaceInstance.id,
		sourceZoneId,
		targetZoneId,
		placement.id,
		x,
		y,
	)

	if (!success) {
		console.error('[WorkspacePage] Failed to move item between zones')
		throw new Error('Failed to move item between zones')
	}

	console.log(
		`[WorkspacePage] Moved item ${placement.id} from zone ${sourceZoneId} to zone ${targetZoneId} at position (${x}, ${y})`,
	)
}

async function handleDeleteItem(zoneId: string, itemId: string) {
	if (!workspaceInstance) {
		throw new Error('Attempt to delete item from undefined workspace')
	}

	// Check if removing items is enabled
	if (!workspaceController.isFeatureEnabled('canRemoveItems')) {
		console.warn('[Workspace] Removing items is currently disabled')
		return
	}

	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (!zone) {
		console.error('[WorkspacePage] Zone not found for deleteItem:', zoneId)
		return
	}

	// Find the item placement
	const placement = zone.placements.find((p) => p.id === itemId)
	if (!placement) {
		console.error('[WorkspacePage] Item not found for deleteItem:', itemId)
		return
	}

	try {
		// Cast to PlantItem
		const plantItem = plantRepository.validateAndCastItem(placement.item)

		// Validate the removal
		const validationResult = await workspaceController.validateItemRemoval(
			workspaceInstance,
			plantItem,
			zone,
			itemId,
		)

		if (!validationResult.isValid) {
			console.warn(`[Workspace] Delete validation failed: ${validationResult.reason}`)
			return // Don't perform the operation if validation fails
		}

		// Use the garden store method that will update the API and then the store
		const success = await removePlantFromZone(workspaceInstance.id, zoneId, itemId)

		if (!success) {
			console.error('[WorkspacePage] Failed to delete item')
		} else {
			console.log(`[WorkspacePage] Deleted item ${itemId} from zone ${zoneId}`)
		}
	} catch (error) {
		console.error('[WorkspacePage] Invalid item type:', error)
		return
	}
}

async function handleCloneItem(
	sourceZoneId: string,
	targetZoneId: string,
	sourcePlantId: string,
	x: number,
	y: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to clone item with undefined workspace')
	}

	// Check if cloning items is enabled
	if (!workspaceController.isFeatureEnabled('canCloneItems')) {
		console.warn('[Workspace] Cloning items is currently disabled')
		throw new Error('Cloning items is currently disabled')
	}

	// Use the garden store method that will update the API and then the store
	const success = await clonePlant(
		workspaceInstance.id,
		sourceZoneId,
		targetZoneId,
		sourcePlantId,
		x,
		y,
	)

	if (!success) {
		console.error('[WorkspacePage] Failed to clone item')
		throw new Error('Failed to clone item')
	}

	console.log(`[WorkspacePage] Cloned item ${sourcePlantId} to zone ${targetZoneId}`)
}
</script>

<PageTitle route={route} />
{#if workspaceInstance}
	<WorkspaceDiagram
		workspace={workspaceInstance}
		handleMoveItemInZone={handleMoveItemInZone}
		handleAddNewItem={handleAddNewItem as AddNewItemHandler<Item>}
		handleDeleteItem={handleDeleteItem}
		moveItemBetweenZones={handleMoveItemToDifferentZone as MoveItemBetweenZonesHandler<Item>}
		handleCloneItem={handleCloneItem}
		itemAdapter={plantRepository}
		controller={workspaceController}
	/>
{/if}
