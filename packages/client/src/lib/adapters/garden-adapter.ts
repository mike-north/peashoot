import { type IGarden, type IGardenBed, type IPlantPlacement } from '@peashoot/types'
import type { Garden } from '../entities/garden'
import { GardenAdapterBase } from './garden-adapter-base'
import type { GardenBed } from '../entities/garden-bed'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { Plant } from '../entities/plant'
import { convertPlant, type PlantResource } from './plant-adapter'

type PlantPlacementResource = IPlantPlacement & { id: `plcmnt_${string}` } & {
	plant: PlantResource
}
type GardenBedResource = IGardenBed & { id: `bed_${string}` } & {
	plantPlacements: PlantPlacementResource[]
}

type GardenResource = IGarden & { id: `grdn_${string}` } & {
	beds: GardenBedResource[]
}

function convertPlantPlacement(
	bedId: string,
	placement: PlantPlacementResource,
): GridPlacement<Plant> {
	const plant = convertPlant(placement.plant)
	return {
		id: placement.id,
		x: placement.position.x,
		y: placement.position.y,
		item: plant,
		size: Math.max(1, Math.round(plant.plantingDistanceInFeet)),
		sourceZoneId: bedId,
	}
}

function convertGardenBed(iGardenBed: GardenBedResource): GardenBed {
	return {
		id: iGardenBed.id,
		width: iGardenBed.rows,
		height: iGardenBed.columns,
		waterLevel: 3,
		sunLevel: 3,
		placements: iGardenBed.plantPlacements.map((placement) =>
			convertPlantPlacement(iGardenBed.id, placement),
		),
	}
}

function convertGarden(iGarden: GardenResource): Garden {
	return {
		id: iGarden.id,
		beds: iGarden.beds.map((iGardenBed) => convertGardenBed(iGardenBed)),
		edgeIndicators: [],
	}
}

export class GardenAdapter extends GardenAdapterBase {
	override async fetchGardens(): Promise<Garden[]> {
		const response = await fetch('http://localhost:3000/api/gardens')
		const data = (await response.json()) as GardenResource[]
		const gardens = data.map(convertGarden)
		console.debug('Gardens fetched.', { gardens })
		return gardens
	}
	override async fetchFirstGarden(): Promise<Garden> {
		const gardens = await this.fetchGardens()
		return gardens[0]
	}
}
