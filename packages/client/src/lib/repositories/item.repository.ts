import { Repository } from './repository.base.js'
import type { ItemAdapter } from '../adapters/item.adapter.js'
import { ItemSchema, PlantMetadataSchema, PlantSchema, type Plant } from '@peashoot/types'

/**
 * Repository for Plant domain entities
 * Handles data access and persistence for Plant entities
 * Also implements ItemAdapter interface for compatibility with existing code
 */
export class ItemRepository
	extends Repository<Plant, string>
	implements ItemAdapter<Plant>
{
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'items'
	}

	protected toDomainEntity(resource: unknown): Plant {
		const item = PlantSchema.parse(resource)
		return {
			...item,
			metadata: PlantMetadataSchema.parse(item.metadata),
		}
	}

	/**
	 * Check if an unknown value is a valid PlantItem
	 * Part of the ItemAdapter interface
	 */
	isValidItem(toTest: unknown): toTest is Plant {
		const item = ItemSchema.safeParse(toTest)
		if (!item.success) return false
		return PlantMetadataSchema.safeParse(item.data.metadata).success
	}

	/**
	 * Validate and cast an item to PlantItem
	 * Part of the ItemAdapter interface
	 */
	validateAndCastItem(item: unknown): Plant {
		if (this.isValidItem(item)) {
			return item
		}

		throw new Error('Invalid plant item')
	}
}
