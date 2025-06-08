import type { PlantMetadata } from '../entities/plant-metadata'
import { Repository } from './repository.base'
import type { PlantResource } from '../adapters/plant-item-adapter'
import { convertPlantItem } from '../adapters/plant-item-adapter'
import type { ItemAdapter } from '../adapters/item-adapter'
import type { Item } from '../entities/item'

/**
 * Repository for Plant domain entities
 * Handles data access and persistence for Plant entities
 * Also implements ItemAdapter interface for compatibility with existing code
 */
export class PlantRepository
	extends Repository<Item<PlantMetadata>, string>
	implements ItemAdapter<Item<PlantMetadata>>
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
