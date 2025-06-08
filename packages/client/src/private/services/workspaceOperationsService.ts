import type { Workspace } from '../../lib/entities/workspace'
import { updateItemPositionInZone, type Zone } from '../../lib/entities/zone'
import { type PlantMetadata } from '../../lib/entities/plant-metadata'
import {
	findZone,
	findItemPlacement,
	moveItemBetweenZonesAndCreateNewWorkspace,
} from '../../lib/entities/workspace'
import type { GridPlacement } from '../grid/grid-placement'
import type { ExistingWorkspaceItem } from '../state/workspaceDragState'
import type { Item } from '../../lib/entities/item'

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
		existingItem: ExistingWorkspaceItem<Item>,
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
		item: Item<PlantMetadata>,
		x: number,
		y: number,
	): Workspace {
		const zone = workspace.zones.find((z: Zone) => z.id === zoneId)
		if (!zone) {
			console.error('[WorkspaceOperationsService] Zone not found for addNewItem:', zoneId)
			return workspace
		}

		const itemForPlacement: Item<PlantMetadata> = {
			...item,
		}
		const newItemId = `${itemForPlacement.category}_${Date.now()}`
		const itemWithSize = {
			...itemForPlacement,
			size: Math.max(1, Math.ceil(itemForPlacement.metadata.plantingDistanceInFeet)),
		}

		const newPlacement: GridPlacement<Item> = {
			id: newItemId,
			x,
			y,
			size: Math.max(1, Math.ceil(itemForPlacement.metadata.plantingDistanceInFeet)),
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

	findItemPlacement(zone: Zone, itemId: string): GridPlacement<Item> | undefined {
		return findItemPlacement(zone, itemId)
	}
}
