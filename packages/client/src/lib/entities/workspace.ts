import type { ItemWithSize, Zone } from './zone'
import type { Item } from './item'
import type { GridPlaceable, GridPlacement } from '../../private/grid/grid-placement'
import type { Indicator } from './indicator'
import { isPlantItem, restorePlantItemMetadata } from '../item-types/plant-item'

export interface Workspace<T extends ItemWithSize = ItemWithSize> {
	readonly id: string
	zones: Zone<T>[]
	/** New flexible indicator system that supports multiple items and sector-based visualization */
	indicators: Indicator[]
}

export function moveItemBetweenZonesAndCreateNewWorkspace(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: GridPlacement<Item>,
	newX: number,
	newY: number,
): Workspace {
	const sourceZone = workspace.zones.find((z: Zone) => z.id === sourceZoneId)
	const targetZone = workspace.zones.find((z: Zone) => z.id === targetZoneId)

	if (!sourceZone || !targetZone) {
		console.error(
			'[workspace.ts] Source or target zone not found for moveItemBetweenZones.',
		)
		return workspace // Return original workspace if zones not found
	}

	// Make sure the item has its metadata preserved
	let itemWithMetadata = placement.item

	// For plant items, ensure metadata is present
	if (itemWithMetadata.id.startsWith('plant_') && !isPlantItem(itemWithMetadata)) {
		console.debug('[workspace.ts] Restoring metadata for plant item during zone move', {
			id: itemWithMetadata.id,
		})
		const restored = restorePlantItemMetadata(itemWithMetadata)
		if (restored) {
			itemWithMetadata = restored
		} else {
			console.warn('[workspace.ts] Failed to restore plant item metadata during move', {
				id: itemWithMetadata.id,
			})
		}
	}

	const updatedSourceZone = {
		...sourceZone,
		placements: sourceZone.placements.filter(
			(p: GridPlacement<Item>) => p.id !== placement.id,
		),
	}

	const updatedTargetZone: Zone = {
		...targetZone,
		placements: [
			...targetZone.placements,
			{
				...placement,
				x: newX,
				y: newY,
				sourceZoneId: targetZoneId,
				item: itemWithMetadata,
			} satisfies GridPlacement<GridPlaceable>,
		],
	}

	return {
		...workspace,
		zones: workspace.zones.map((z: Zone) => {
			if (z.id === sourceZoneId) return updatedSourceZone
			if (z.id === targetZoneId) return updatedTargetZone
			return z
		}),
	}
}

export function findZone(workspace: Workspace, zoneId: string): Zone | undefined {
	return workspace.zones.find((zone) => zone.id === zoneId)
}

export function findItemPlacement(
	zone: Zone,
	itemPlacementId: string,
): GridPlacement<Item> | undefined {
	return zone.placements.find((pp: GridPlacement<Item>) => pp.id === itemPlacementId)
}
