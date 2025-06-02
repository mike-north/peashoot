import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { Plant } from '../entities/plant'
import { PlantAdapterBase } from './plant-adapter-base'

export type PlantResource = IPlant & { id: `plant_${string}` }

export function convertPlant(iPlant: PlantResource): Plant {
	const plantingDistanceInFeet = convertDistanceToFeet(iPlant.plantingDistance).value
	return {
		id: iPlant.id,
		displayName: iPlant.name,
		family: iPlant.family,
		variant: iPlant.name,
		presentation: {
			iconPath: iPlant.presentation.iconPath,
			accentColor: iPlant.presentation.accentColor,
			size: Math.max(1, Math.round(plantingDistanceInFeet)),
		},
		plantingDistanceInFeet: Math.round(plantingDistanceInFeet * 100) / 100,
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
