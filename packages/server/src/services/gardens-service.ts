import { Garden } from '../entities/garden'
import { AppDataSource } from '../data-source'
import { isIdWithPrefix } from '../utils/id'
import { InvalidArgsError } from '../application/errors/invalid-args-error'
import {
	convertDistanceToFeet,
	ItemPlacement,
	Zone,
	type ListWorkspacesResponse,
} from '@peashoot/types'

export class GardensService {
	async getAllGardens(): Promise<ListWorkspacesResponse> {
		const gardens = await AppDataSource.manager.find(Garden, {
			relations: {
				beds: {
					placements: {
						item: true,
					},
				},
			},
		})
		return gardens.map((garden) => ({
			id: garden.id,
			name: garden.name,
			description: garden.description,
			indicators: [],
			zones: garden.beds.map(
				(bed) =>
					({
						id: bed.id,
						name: bed.name,
						width: bed.width,
						height: bed.height,
						description: bed.description,
						metadata: {},
						placements: bed.placements.map(
							(placement) =>
								({
									id: placement.id,
									position: placement.position,
									sourceZoneId: bed.id,
									item: {
										id: placement.item.id,
										category: placement.item.family,
										variant: placement.item.variant,
										displayName: placement.item.name,
										size: Math.max(
											1,
											Math.ceil(
												convertDistanceToFeet(placement.item.plantingDistance).value,
											),
										),
										presentation: {
											iconPath: placement.item.presentation.iconPath,
											accentColor: placement.item.presentation.accentColor,
										},
										metadata: {
											plantingDistance: placement.item.plantingDistance,
										},
									},
								}) satisfies ItemPlacement,
						),
					}) satisfies Zone,
			),
			metadata: {},
		}))
	}
	async getGardenById(id: string): Promise<Garden | null> {
		if (!isIdWithPrefix('grdn', id)) {
			throw new InvalidArgsError('Invalid garden id')
		}
		return await AppDataSource.manager.findOne(Garden, { where: { id } })
	}
}
