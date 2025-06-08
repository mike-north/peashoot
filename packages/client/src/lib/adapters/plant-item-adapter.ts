import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { PlantMetadata } from '../entities/plant-metadata'
import { isPlantMetadata } from '../entities/plant-metadata'
import { isItemWithMetadata, type Item } from '../entities/item'
import type { ItemAdapter } from './item-adapter'

export type PlantResource = IPlant & { id: `plant_${string}` }

export function convertPlantItem(iPlant: PlantResource): Item<PlantMetadata> {
	const plantingDistanceInFeet = convertDistanceToFeet(iPlant.plantingDistance).value

	// Use the new function
	return {
		id: iPlant.id,
		displayName: iPlant.name,
		category: iPlant.family,
		variant: iPlant.name,
		size: Math.max(1, Math.ceil(plantingDistanceInFeet)),
		presentation: {
			iconPath: iPlant.iconPath,
			accentColor: iPlant.accentColor,
		},
		metadata: {
			plantingDistanceInFeet,
		},
	}
}

/**
 * Plant-specific implementation of ItemAdapter
 */
export class PlantItemAdapter implements ItemAdapter<Item<PlantMetadata>> {
	isValidItem(item: unknown): item is Item<PlantMetadata> {
		return isItemWithMetadata(item, isPlantMetadata)
	}

	/**
	 * Safely validate and cast an item to PlantItem
	 * @throws Error if the item is not a valid PlantItem
	 */
	validateAndCastItem(item: unknown): Item<PlantMetadata> {
		// First try direct validation
		if (isItemWithMetadata(item, isPlantMetadata)) {
			return item
		} else {
			console.error('Item is not a plant item', item)
			throw new Error('Item is not a plant item')
		}
	}

	async fetchPlants(): Promise<Item<PlantMetadata>[]> {
		const response = await fetch('http://localhost:3000/api/plants')
		const data = (await response.json()) as PlantResource[]
		const plants = data.map(convertPlantItem)
		console.debug('Plants fetched.', { plants })
		return plants
	}
}
