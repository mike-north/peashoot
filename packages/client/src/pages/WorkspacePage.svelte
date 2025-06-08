<script lang="ts">
import WorkspaceDiagram from '../private/components/WorkspaceDiagram.svelte'
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import { WorkspaceAdapter } from '../lib/adapters/workspace-adapter'
import {
	moveItemBetweenZonesAndCreateNewWorkspace,
	type Workspace,
} from '../lib/entities/workspace'
import type { GridPlacement } from '../private/grid/grid-placement'
import { PlantItemAdapter } from '../lib/adapters/plant-item-adapter'
import {
	updateItemPositionInZone,
	type Zone,
	type ItemWithSize,
} from '../lib/entities/zone'
import type { PlantItem } from '../lib/item-types/plant-item'
import { WorkspaceController } from '../lib/controllers/WorkspaceController'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'

const {
	route,
	controller,
}: { route: RouteResult; controller: WorkspaceController<PlantItem> } = $props()
const workspaceAdapter = new WorkspaceAdapter()
const plantAdapter = new PlantItemAdapter()

// Create workspace controller with default rules
const workspaceController = $state(controller)

let workspaceInstance: Workspace | undefined = $state<Workspace | undefined>(undefined)

onMount(() => {
	workspaceAdapter
		.fetchFirstWorkspace()
		.then((workspace) => {
			workspaceInstance = workspace
		})
		.catch((err: unknown) => {
			console.error('Error fetching workspaces', { cause: err })
		})
})

async function moveItemBetweenZones(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: GridPlacement<PlantItem>,
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
		const plantItem = plantAdapter.validateAndCastItem(placement.item)

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

		const newWorkspace = moveItemBetweenZonesAndCreateNewWorkspace(
			workspace,
			sourceZoneId,
			targetZoneId,
			placement,
			newX,
			newY,
		)
		workspaceInstance = newWorkspace
	} catch (error) {
		console.error('[WorkspacePage] Invalid item type:', error)
		return
	}
}

async function handleAddNewItem(zoneId: string, item: PlantItem, x: number, y: number) {
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

	const newItemId = `${item.category}_${Date.now()}`

	const newPlacement: GridPlacement<ItemWithSize> = {
		id: newItemId,
		x,
		y,
		size: plantAdapter.getItemSize(item),
		item: item,
		sourceZoneId: zoneId,
	}

	workspaceInstance.zones = workspaceInstance.zones.map((z: Zone) =>
		z.id === zoneId ? { ...z, placements: [...z.placements, newPlacement] } : z,
	)

	console.log(
		`[Workspace] Added new ${item.displayName} to zone ${zoneId} at (${x}, ${y})`,
	)
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
		const plantItem = plantAdapter.validateAndCastItem(placement.item)

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

		workspaceInstance.zones = workspaceInstance.zones.map((z: Zone) =>
			z.id === zoneId ? updateItemPositionInZone(z, itemId, newX, newY) : z,
		)
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
		const plantItem = plantAdapter.validateAndCastItem(placement.item)

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

		workspaceInstance.zones = workspaceInstance.zones.map((z: Zone) =>
			z.id === zoneId
				? { ...z, placements: z.placements.filter((p) => p.id !== itemId) }
				: z,
		)
		console.log(`[WorkspacePage] Deleted item ${itemId} from zone ${zoneId}`)
	} catch (error) {
		console.error('[WorkspacePage] Invalid item type:', error)
		return
	}
}
</script>

<PageTitle route={route} />
{#if workspaceInstance}
	<WorkspaceDiagram
		workspace={workspaceInstance}
		handleMoveItemInZone={handleMoveItemInZone}
		handleAddNewItem={handleAddNewItem}
		handleDeleteItem={handleDeleteItem}
		moveItemBetweenZones={moveItemBetweenZones}
		itemAdapter={plantAdapter}
		controller={workspaceController}
	/>
{/if}
