import { timeout } from '../../utils/promise'
import type { Plant } from '../entities/plant'
import { plants } from '../fixture-data'

export abstract class PlantAdapterBase {
	async fetchPlants(): Promise<Plant[]> {
		await timeout(200) // Fake delay to simulate network call
		return plants
	}
}
