import { Plant as IPlant, ListItemsResponse, PlantSchema } from '@peashoot/types'
import { AppDataSource } from '../data-source'
import { Plant } from '../entities/plant'

export class PlantsService {
	async getAllPlants(): Promise<ListItemsResponse> {
		const plants = await AppDataSource.manager.find(Plant)
		return plants.map((plant) => ({
			id: plant.id,
			category: plant.family,
			variant: plant.variant,
			displayName: plant.name,
			size: 1,
			presentation: {
				iconPath: plant.presentation.iconPath,
				accentColor: plant.presentation.accentColor,
			},
			metadata: {
				plantingDistance: plant.plantingDistance,
			},
		}))
	}

	parsePlantParams(params: unknown): IPlant {
		return PlantSchema.parse(params)
	}
}
