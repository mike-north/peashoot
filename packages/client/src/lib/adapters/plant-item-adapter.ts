import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { PlantItem } from '../item-types/plant-item'
import {
	isPlantItem,
	createPlantItem,
	restorePlantItemMetadata,
} from '../item-types/plant-item'
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

	/**
	 * Safely validate and cast an item to PlantItem
	 * @throws Error if the item is not a valid PlantItem
	 */
	validateAndCastItem(item: unknown): PlantItem {
		// First try direct validation
		if (isPlantItem(item)) {
			return item
		}

		// If validation failed, try to restore metadata
		const restoredItem = restorePlantItemMetadata(item)
		if (restoredItem) {
			return restoredItem
		}

		// If we got here, the item can't be recovered
		// Check the item type for detailed error
		if (!item) {
			throw new Error('Item is undefined or null')
		}

		if (typeof item !== 'object') {
			throw new Error(`Item is not an object (type: ${typeof item})`)
		}

		// Check if it has the necessary properties
		if (!('id' in item)) {
			throw new Error('Item is missing id property')
		}

		if (!('metadata' in item)) {
			throw new Error('Item is missing metadata property')
		}

		// Full validation
		const metadata = 'metadata' in item ? (item as { metadata: unknown }).metadata : null
		throw new Error(
			`Item failed plant validation: id=${
				'id' in item ? String((item as { id: unknown }).id) : 'missing'
			}, has metadata=${!!metadata}, keys=${
				metadata && typeof metadata === 'object'
					? Object.keys(metadata).join(',')
					: 'none'
			}`,
		)
	}

	async fetchPlants(): Promise<PlantItem[]> {
		const response = await fetch('http://localhost:3000/api/plants')
		const data = (await response.json()) as PlantResource[]
		const plants = data.map(convertPlantItem)
		console.debug('Plants fetched.', { plants })
		return plants
	}
}
