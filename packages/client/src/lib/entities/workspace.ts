import type { GridPlacement } from '../../private/grid/grid-placement'
import type { Item, ItemPlacement, Workspace, Zone } from '@peashoot/types'

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

	const updatedSourceZone = {
		...sourceZone,
		placements: sourceZone.placements.filter((p) => p.id !== placement.id),
	}

	const updatedTargetZone: Zone = {
		...targetZone,
		placements: [
			...targetZone.placements,
			{
				...placement,
				position: {
					x: newX,
					y: newY,
				},
				sourceZoneId: targetZoneId,
				item: placement.item,
			},
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
): ItemPlacement | undefined {
	return zone.placements.find((pp) => pp.id === itemPlacementId)
}
