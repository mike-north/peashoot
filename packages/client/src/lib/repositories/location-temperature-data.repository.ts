import {
	CalculateDateResponseSchema,
	LocationSchema,
	type CalculateDateRequest,
	type Location,
} from '@peashoot/types'
import { Repository } from './repository.base'

export class LocationTemperatureDataRepository extends Repository<Location, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected toDomainEntity(resource: unknown): Location {
		return LocationSchema.parse(resource)
	}

	protected getEndpoint(): string {
		return 'locations'
	}

	async getLocations(): Promise<Location[]> {
		return this.findAll()
	}

	async calculateDate(request: CalculateDateRequest): Promise<Date> {
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/locations/${request.locationId}/calculate-date`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(request),
				},
			)

			if (!response.ok) {
				throw new Error('Failed to calculate date')
			}
			const result = CalculateDateResponseSchema.parse(await response.json())
			return new Date(result.date)
		} catch (error) {
			console.error('Error calculating date:', error)
			throw error
		}
	}
}
