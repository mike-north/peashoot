import type { PlantMetadata } from '../entities/plant-metadata'
import type { Item } from '../entities/item'
import { plants } from '../fixture-data'
import type { IPlantRepository } from './plant.repository'

/**
 * Repository for Plant domain entities
 * Handles data access and persistence for Plant entities
 * Also implements ItemAdapter interface for compatibility with existing code
 */
export class PlantFixturesRepository implements IPlantRepository {
	async findAll(): Promise<Item<PlantMetadata>[]> {
		return Promise.resolve(plants)
	}
}
