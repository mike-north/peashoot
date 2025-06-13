import { Plant as IPlant, PlantSchema } from '@peashoot/types'
import { AppDataSource } from '../data-source.js'
import { Plant } from '../entities/plant.js'
import { DeepPartial, Repository } from 'typeorm'
import ld from 'lodash'
import { SeedPacket } from '../entities/seed-packet.js'

export class PlantsService {
	async getAllPlants(): Promise<Plant[]> {
		return await AppDataSource.manager.find(Plant)
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
