import type { Location } from '../entities/location'
import { Repository } from './repository.base'

interface CalculateDateRequest {
	locationId: string
	temperature: {
		value: number
		unit: 'C' | 'F'
	}
}

interface CalculateDateResponse {
	date: string
}

export class LocationTemperatureDataRepository extends Repository<Location, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected toDomainEntity(resource: unknown): Location {
		return resource as Location
	}

	protected toResource(entity: Location): unknown {
		return entity
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

			const result = (await response.json()) as CalculateDateResponse
			return new Date(result.date)
		} catch (error) {
			console.error('Error calculating date:', error)
			throw error
		}
	}
}
