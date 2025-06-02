import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { Plant } from '../entities/plant'
import { PlantAdapterBase } from './plant-adapter-base'

export type PlantResource = IPlant & { id: `plant_${string}` }

export function convertPlant(iPlant: PlantResource): Plant {
	return {
		id: iPlant.id,
		displayName: iPlant.name,
		family: iPlant.family,
		variant: iPlant.name,
		presentation: {
			iconPath: iPlant.presentation.iconPath,
			accentColor: iPlant.presentation.accentColor,
			size: 1,
		},
		plantingDistanceInFeet: convertDistanceToFeet(iPlant.plantingDistance).value,
	}
}

export class PlantAdapter extends PlantAdapterBase {
	async fetchPlants(): Promise<Plant[]> {
		const response = await fetch('http://localhost:3000/api/plants')
		const data = (await response.json()) as PlantResource[]
		const plants = data.map(convertPlant)
		console.debug('Plants fetched.', { plants })
		return plants
	}
}
