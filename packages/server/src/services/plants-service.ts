import {
	convertDistanceToFeet,
	Plant as IPlant,
	ListItemsResponse,
	PlantSchema,
} from '@peashoot/types'
import { AppDataSource } from '../data-source'
import { Plant } from '../entities/plant'
import { DeepPartial, Repository } from 'typeorm'
import * as ld from 'lodash'
import { SeedPacket } from '../entities/seed-packet'

export class PlantsService {
	async getAllPlants(): Promise<ListItemsResponse> {
		const plants = await AppDataSource.manager.find(Plant)
		return plants.map((plant) => ({
			id: plant.id,
			category: plant.family,
			variant: plant.variant,
			displayName: plant.name,
			size: Math.max(1, Math.ceil(convertDistanceToFeet(plant.plantingDistance).value)),
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

	generatePlantFromSeedPacket(
		plantRepo: Repository<Plant>,
		seedPacket: SeedPacket,
	): Plant {
		const variant = ld.kebabCase(seedPacket.name)
		const iconPath = `${seedPacket.category}-${variant}.png`
		const plant = plantRepo.create({
			seedPacket,
			name: seedPacket.name,
			description: seedPacket.description,
			presentation: seedPacket.presentation,
			family: seedPacket.category,
			plantingDistance: seedPacket.plantingDistance,
			variant,
			iconPath,
			accentColor: seedPacket.presentation.accentColor,
		} satisfies DeepPartial<Plant>)
		return plant
	}
}
