import { IPlant, Plant, PlantSchema } from '../entities/plant'
import { AppDataSource } from '../data-source'

export class PlantsService {
	async getAllPlants(): Promise<Plant[]> {
		return await AppDataSource.manager.find(Plant)
	}

	parsePlantParams(params: unknown): IPlant {
		return PlantSchema.parse(params)
	}
}
