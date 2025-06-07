import { IPlant, PlantSchema } from '@peashoot/types'
import { AppDataSource } from '../data-source'
import { Plant } from '../entities/plant'

export class PlantsService {
	async getAllPlants(): Promise<Plant[]> {
		return await AppDataSource.manager.find(Plant)
	}

	parsePlantParams(params: unknown): IPlant {
		return PlantSchema.parse(params)
	}
}
