import { Garden } from '../entities/garden'
import { AppDataSource } from '../data-source'
import { isIdWithPrefix } from '../utils/id'
import { InvalidArgsError } from '../application/errors/invalid-args-error'

export class GardensService {
	async getAllGardens(): Promise<Garden[]> {
		return await AppDataSource.manager.find(Garden, {
			relations: {
				beds: {
					plantPlacements: {
						plant: true,
					},
				},
			},
		})
	}
	async getGardenById(id: string): Promise<Garden | null> {
		if (!isIdWithPrefix('grdn', id)) {
			throw new InvalidArgsError('Invalid garden id')
		}
		return await AppDataSource.manager.findOne(Garden, { where: { id } })
	}
}
