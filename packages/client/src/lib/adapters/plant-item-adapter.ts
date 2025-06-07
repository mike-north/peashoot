import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { PlantItem } from '../item-types/plant-item'
import { isPlantItem, createPlantItem } from '../item-types/plant-item'
import { tileSizeForItem, categoryNameForItem } from '../entities/item'
import type { ItemAdapter } from './item-adapter'

export type PlantResource = IPlant & { id: `plant_${string}` }

export function convertPlantItem(iPlant: PlantResource): PlantItem {
	const plantingDistanceInFeet = convertDistanceToFeet(iPlant.plantingDistance).value
	return createPlantItem({
		id: iPlant.id,
		displayName: iPlant.name,
		variant: iPlant.name,
		presentation: {
			iconPath: iPlant.presentation.iconPath,
			accentColor: iPlant.presentation.accentColor,
			size: Math.max(1, Math.round(plantingDistanceInFeet)),
		},
		family: iPlant.family,
		plantingDistanceInFeet: Math.round(plantingDistanceInFeet * 100) / 100,
	})
}

/**
 * Plant-specific implementation of ItemAdapter
 */
export class PlantItemAdapter implements ItemAdapter<PlantItem> {
	getItemSize(item: PlantItem): number {
		return tileSizeForItem(item)
	}

	getCategoryName(item: PlantItem): string {
		return categoryNameForItem(item)
	}

	isValidItem(item: unknown): item is PlantItem {
		return isPlantItem(item)
	}

	async fetchPlants(): Promise<PlantItem[]> {
		const response = await fetch('http://localhost:3000/api/plants')
		const data = (await response.json()) as PlantResource[]
		const plants = data.map(convertPlantItem)
		console.debug('Plants fetched.', { plants })
		return plants
	}
}
