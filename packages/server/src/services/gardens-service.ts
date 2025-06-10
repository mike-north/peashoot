import { Garden } from '../entities/garden'
import { AppDataSource } from '../data-source'
import { isIdWithPrefix } from '../utils/id'
import { InvalidArgsError } from '../application/errors/invalid-args-error'
import { Logger } from 'winston'
import { DeepPartial } from 'typeorm'

export class GardensService {
	async getAllGardens(): Promise<Garden[]> {
		return await AppDataSource.manager.find(Garden, {})
	}
	async getGardenById(id: string): Promise<Garden | null> {
		if (!isIdWithPrefix('grdn', id)) {
			throw new InvalidArgsError('Invalid garden id')
		}
		return await AppDataSource.manager.findOne(Garden, { where: { id } })
	}

	async createExampleGarden(logger: Logger) {
		const gardenRepo = AppDataSource.getRepository(Garden)

		let garden = gardenRepo.create({
			name: 'My Garden',
			description: 'My garden',
		} satisfies DeepPartial<Garden>)
		garden = await gardenRepo.save(garden)
		logger.info('Garden saved', { garden: garden.name, id: garden.id })
	}
}
