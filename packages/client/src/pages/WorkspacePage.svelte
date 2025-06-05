<script lang="ts">
import WorkspaceDiagram from '../private/components/WorkspaceDiagram.svelte'
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import { WorkspaceAdapter } from '../lib/adapters/workspace-adapter'
import {
	moveItemBetweenZonesAndCreateNewWorkspace,
	type Workspace,
} from '../lib/entities/workspace'
import type { GridPlaceable, GridPlacement } from '../private/grid/grid-placement'
import { PlantItemAdapter } from '../lib/adapters/plant-item-adapter'
import { updateItemPositionInZone, type Zone, type ItemWithSize } from '../lib/entities/zone'
import type { PlantItem } from '../lib/item-types/plant-item'

const { route } = $props()
const workspaceAdapter = new WorkspaceAdapter()
const plantAdapter = new PlantItemAdapter()

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

function moveItemBetweenZones(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: GridPlacement<GridPlaceable>,
	newX: number,
	newY: number,
) {
	const newWorkspace = moveItemBetweenZonesAndCreateNewWorkspace(
		workspace,
		sourceZoneId,
		targetZoneId,
		placement,
		newX,
		newY,
	)
	workspaceInstance = newWorkspace
}

function handleAddNewItem(zoneId: string, item: PlantItem, x: number, y: number) {
	if (!workspaceInstance) {
		throw new Error('Attempt to add new item to undefined workspace')
	}
	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (zone) {
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

		console.log(`[Workspace] Added new ${item.displayName} to zone ${zoneId} at (${x}, ${y})`)
	} else {
		console.error('[Workspace] Zone not found for addNewItem:', zoneId)
	}
}

function handleMoveItemInZone(
	zoneId: string,
	itemId: string,
	newX: number,
	newY: number,
) {
	if (!workspaceInstance) {
		throw new Error('Attempt to move item in zone in undefined workspace')
	}
	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (zone) {
		workspaceInstance.zones = workspaceInstance.zones.map((z: Zone) =>
			z.id === zoneId ? updateItemPositionInZone(z, itemId, newX, newY) : z,
		)
	} else {
		console.error('[WorkspacePage] Zone not found for moveItemInZone:', zoneId)
	}
}

function handleDeleteItem(zoneId: string, itemId: string) {
	if (!workspaceInstance) {
		throw new Error('Attempt to delete item from undefined workspace')
	}
	const zone = workspaceInstance.zones.find((z: Zone) => z.id === zoneId)
	if (zone) {
		workspaceInstance.zones = workspaceInstance.zones.map((z: Zone) =>
			z.id === zoneId
				? { ...z, placements: z.placements.filter((p) => p.id !== itemId) }
				: z,
		)
		console.log(`[WorkspacePage] Deleted item ${itemId} from zone ${zoneId}`)
	} else {
		console.error('[WorkspacePage] Zone not found for deleteItem:', zoneId)
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
	/>
{/if} 