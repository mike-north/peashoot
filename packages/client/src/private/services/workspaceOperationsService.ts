import type { Workspace } from '../../lib/entities/workspace'
import {
	updateItemPositionInZone,
	type Zone,
	type ItemWithSize,
} from '../../lib/entities/zone'
import type { PlantItem } from '../../lib/item-types/plant-item'
import { getPlantProperties } from '../../lib/item-types/plant-item'
import {
	findZone,
	findItemPlacement,
	moveItemBetweenZonesAndCreateNewWorkspace,
} from '../../lib/entities/workspace'
import type { GridPlacement } from '../grid/grid-placement'
import type { ExistingWorkspaceItem } from '../state/workspaceDragState'

export class WorkspaceOperationsService {
	moveItemInZone(
		workspace: Workspace,
		zoneId: string,
		itemId: string,
		newX: number,
		newY: number,
	): Workspace {
		const zone = workspace.zones.find((z: Zone) => z.id === zoneId)
		if (!zone) {
			console.error(
				'[WorkspaceOperationsService] Zone not found for moveItemInZone:',
				zoneId,
			)
			return workspace
		}

		return {
			...workspace,
			zones: workspace.zones.map((z: Zone) =>
				z.id === zoneId ? updateItemPositionInZone(z, itemId, newX, newY) : z,
			),
		}
	}

	moveItemToDifferentZone(
		workspace: Workspace,
		sourceZoneId: string,
		targetZoneId: string,
		existingItem: ExistingWorkspaceItem<ItemWithSize>,
		newX: number,
		newY: number,
	): Workspace {
		// Use the existing item directly since ExistingWorkspaceItem is now GridPlacement
		return moveItemBetweenZonesAndCreateNewWorkspace(
			workspace,
			sourceZoneId,
			targetZoneId,
			existingItem,
			newX,
			newY,
		)
	}

	addNewItem(
		workspace: Workspace,
		zoneId: string,
		item: PlantItem,
		x: number,
		y: number,
	): Workspace {
		const zone = workspace.zones.find((z: Zone) => z.id === zoneId)
		if (!zone) {
			console.error('[WorkspaceOperationsService] Zone not found for addNewItem:', zoneId)
			return workspace
		}

		const itemForPlacement: PlantItem = {
			...item,
		}
		const plantProps = getPlantProperties(itemForPlacement)
		const newItemId = `${plantProps.family}_${Date.now()}`
		const itemWithSize = {
			...itemForPlacement,
			size: plantProps.plantingDistanceInFeet,
		}

		const newPlacement: GridPlacement<ItemWithSize> = {
			id: newItemId,
			x,
			y,
			size: plantProps.plantingDistanceInFeet,
			item: itemWithSize,
			sourceZoneId: zoneId,
		}

		return {
			...workspace,
			zones: workspace.zones.map((z: Zone) =>
				z.id === zoneId ? { ...z, placements: [...z.placements, newPlacement] } : z,
			),
		}
	}

	deleteItem(workspace: Workspace, itemId: string, zoneId: string): Workspace {
		const zone = workspace.zones.find((z: Zone) => z.id === zoneId)
		if (!zone) {
			console.error('[WorkspaceOperationsService] Zone not found for deleteItem:', zoneId)
			return workspace
		}

		return {
			...workspace,
			zones: workspace.zones.map((z: Zone) =>
				z.id === zoneId
					? { ...z, placements: z.placements.filter((p) => p.id !== itemId) }
					: z,
			),
		}
	}

	findZone(workspace: Workspace, zoneId: string): Zone | undefined {
		return findZone(workspace, zoneId)
	}

	findItemPlacement(zone: Zone, itemId: string): GridPlacement<ItemWithSize> | undefined {
		return findItemPlacement(zone, itemId)
	}
}
