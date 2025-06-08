<script lang="ts">
import WorkspaceDiagram, {
	type AddNewItemHandler,
	type MoveItemBetweenZonesHandler,
} from '../private/components/WorkspaceDiagram.svelte'
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import type { Workspace } from '../lib/entities/workspace'
import type { GridPlacement } from '../private/grid/grid-placement'
import type { Zone } from '../lib/entities/zone'
import type { PlantMetadata } from '../lib/entities/plant-metadata'
import { WorkspaceController } from '../lib/controllers/WorkspaceController'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import {
	loadFirstGarden,
	currentGarden,
	addPlantToGarden,
	movePlantWithinZone,
	movePlantBetweenZones,
	removePlantFromZone,
	clonePlant,
} from '../lib/state/gardenStore'
import { PlantRepository } from '../lib/repositories/plant.repository'
import type { Item } from '../lib/entities/item'

const {
	route,
	controller,
}: { route: RouteResult; controller: WorkspaceController<Item<PlantMetadata>> } = $props()

// Create plant repository and workspace controller
const plantRepository = new PlantRepository()
const workspaceController = $derived(controller)

// Use the currentGarden store directly
const workspaceInstance = $derived($currentGarden || undefined)

onMount(() => {
	loadFirstGarden().catch((err: unknown) => {
		console.error('Error fetching garden', { cause: err })
	})
})

async function moveItemBetweenZones(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: GridPlacement<Item<PlantMetadata>>,
	newX: number,
	newY: number,
) {
	// Get zone objects from IDs
	const sourceZone = workspace.zones.find((z) => z.id === sourceZoneId)
	const targetZone = workspace.zones.find((z) => z.id === targetZoneId)

	if (!sourceZone || !targetZone) {
		console.error(
			'[WorkspacePage] Source or target zone not found:',
			sourceZoneId,
			targetZoneId,
		)
		return
	}

	try {
		// Cast to PlantItem
		const plantItem = plantRepository.validateAndCastItem(placement.item)

		// First validate the move using the controller
		const validationResult = await workspaceController.validateItemMove(
			workspace,
			plantItem,
			sourceZone,
			targetZone,
			newX,
			newY,
			placement.id,
		)

		if (!validationResult.isValid) {
			console.warn(`[Workspace] Move validation failed: ${validationResult.reason}`)
			return // Don't perform the operation if validation fails
		}

		// Use the garden store method that will update the API and then the store
		const success = await movePlantBetweenZones(
			workspace.id,
			sourceZoneId,
			targetZoneId,
			placement.id,
			newX,
			newY,
		)

		if (!success) {
			console.error('[WorkspacePage] Failed to move item between zones')
		}
	} catch (error) {
		console.error('[WorkspacePage] Invalid item type:', error)
		return
	}
}

async function handleAddNewItem(
	zoneId: string,
	item: Item<PlantMetadata>,
	x: number,
	y: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to add new item to undefined workspace')
	}

	// Check if adding items is enabled
	if (!workspaceController.isFeatureEnabled('canAddItems')) {
		console.warn('[Workspace] Adding items is currently disabled')
		return
	}

	// Get the zone object from ID
	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (!zone) {
		console.error('[WorkspacePage] Zone not found for addNewItem:', zoneId)
		return
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
		return // Don't perform the operation if validation fails
	}

	// Use the garden store method that will update the API and then the store
	const success = await addPlantToGarden(workspaceInstance.id, zoneId, item, x, y)

	if (!success) {
		console.error('[WorkspacePage] Failed to add new item')
	} else {
		console.log(
			`[Workspace] Added new ${item.displayName} to zone ${zoneId} at (${x}, ${y})`,
		)
	}
}

async function handleMoveItemInZone(
	zoneId: string,
	itemId: string,
	newX: number,
	newY: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to move item in zone in undefined workspace')
	}

	// Check if moving items within zones is enabled
	if (!workspaceController.isFeatureEnabled('canDragItemsWithinZone')) {
		console.warn('[Workspace] Moving items within zones is currently disabled')
		return
	}

	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (!zone) {
		console.error('[WorkspacePage] Zone not found for moveItemInZone:', zoneId)
		return
	}

	// Find the item placement
	const placement = zone.placements.find((p) => p.id === itemId)
	if (!placement) {
		console.error('[WorkspacePage] Item not found for moveItemInZone:', itemId)
		return
	}

	try {
		// Cast to PlantItem
		const plantItem = plantRepository.validateAndCastItem(placement.item)

		// Validate the move
		const validationResult = await workspaceController.validateItemPlacement(
			workspaceInstance,
			plantItem,
			zone,
			newX,
			newY,
			itemId,
		)

		if (!validationResult.isValid) {
			console.warn(`[Workspace] Move validation failed: ${validationResult.reason}`)
			return // Don't perform the operation if validation fails
		}

		// Use the garden store method that will update the API and then the store
		const success = await movePlantWithinZone(
			workspaceInstance.id,
			zoneId,
			itemId,
			newX,
			newY,
		)

		if (!success) {
			console.error('[WorkspacePage] Failed to move item in zone')
		}
	} catch (error) {
		console.error('[WorkspacePage] Invalid item type:', error)
		return
	}
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
		return
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
	} else {
		console.log(`[WorkspacePage] Cloned item ${sourcePlantId} to zone ${targetZoneId}`)
	}
}
</script>

<PageTitle route={route} />
{#if workspaceInstance}
	<WorkspaceDiagram
		workspace={workspaceInstance}
		handleMoveItemInZone={handleMoveItemInZone}
		handleAddNewItem={handleAddNewItem as AddNewItemHandler<Item>}
		handleDeleteItem={handleDeleteItem}
		moveItemBetweenZones={moveItemBetweenZones as MoveItemBetweenZonesHandler<Item>}
		handleCloneItem={handleCloneItem}
		itemAdapter={plantRepository}
		controller={workspaceController as WorkspaceController}
	/>
{/if}
