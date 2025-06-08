import { convertDistanceToFeet, type IPlant } from '@peashoot/types'
import type { PlantMetadata } from '../entities/plant-metadata'
import type { Item } from '../entities/item'
import { Repository } from './repository.base'
import type { ItemAdapter } from '../adapters/item.adapter'

export interface IPlantRepository {
	findAll(): Promise<Item<PlantMetadata>[]>
}

export type PlantResource = IPlant & { id: `plant_${string}` }

/**
 * Convert a plant resource from API to domain entity
 */
export function convertPlantItem(iPlant: PlantResource): Item<PlantMetadata> {
	const plantingDistanceInFeet = convertDistanceToFeet(iPlant.plantingDistance).value

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
 * Repository for Plant domain entities
 * Handles data access and persistence for Plant entities
 * Also implements ItemAdapter interface for compatibility with existing code
 */
export class PlantRepository
	extends Repository<Item<PlantMetadata>, string>
	implements ItemAdapter<Item<PlantMetadata>>, IPlantRepository
{
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'plants'
	}

	protected toDomainEntity(resource: unknown): Item<PlantMetadata> {
		return convertPlantItem(resource as PlantResource)
	}

	protected toResource(entity: Item<PlantMetadata>): unknown {
		// Return the entity directly, or transform it for the API if needed
		return entity
	}

	/**
	 * Check if an unknown value is a valid PlantItem
	 * Part of the ItemAdapter interface
	 */
	isValidItem(item: unknown): item is Item<PlantMetadata> {
		return (
			typeof item === 'object' &&
			item !== null &&
			'id' in item &&
			typeof item.id === 'string' &&
			item.id.startsWith('plant_') &&
			'metadata' in item &&
			typeof item.metadata === 'object' &&
			item.metadata !== null &&
			'plantingDistanceInFeet' in item.metadata
		)
	}

	/**
	 * Validate and cast an item to PlantItem
	 * Part of the ItemAdapter interface
	 */
	validateAndCastItem(item: unknown): Item<PlantMetadata> {
		if (this.isValidItem(item)) {
			return item
		}

		throw new Error('Invalid plant item')
	}
}
