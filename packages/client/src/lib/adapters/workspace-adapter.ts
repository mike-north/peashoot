import { type IGarden, type IGardenBed, type IPlantPlacement } from '@peashoot/types'
import type { Workspace } from '../entities/workspace'
import { WorkspaceAdapterBase } from './workspace-adapter-base'
import type { Zone } from '../entities/zone'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { PlantItem } from '../item-types/plant-item'
import { convertPlantItem, type PlantResource } from './plant-item-adapter'

type PlantPlacementResource = IPlantPlacement & { id: `plcmnt_${string}` } & {
	plant: PlantResource
}

type ZoneResource = IGardenBed & {
	id: `bed_${string}`
	plantPlacements: PlantPlacementResource[]
}

export type WorkspaceResource = IGarden & {
	id: `grdn_${string}`
	beds: ZoneResource[]
}

function convertPlantPlacement(
	zoneId: string,
	placement: PlantPlacementResource,
): GridPlacement<PlantItem> {
	const plant = convertPlantItem(placement.plant)
	return {
		id: placement.id,
		x: placement.position.x,
		y: placement.position.y,
		item: plant,
		size: Math.max(1, Math.round(plant.metadata.plantingDistanceInFeet)),
		sourceZoneId: zoneId,
	}
}

export function convertZone(iZone: ZoneResource): Zone {
	return {
		id: iZone.id,
		width: iZone.rows,
		height: iZone.columns,
		waterLevel: 3,
		sunLevel: 3,
		placements: iZone.plantPlacements.map((placement) =>
			convertPlantPlacement(iZone.id, placement),
		),
	}
}


export class WorkspaceAdapter extends WorkspaceAdapterBase {
	async fetchWorkspaces(): Promise<Workspace[]> {
		// For now, delegate to base class that converts garden fixture data
		return super.fetchWorkspaces()
	}
}
