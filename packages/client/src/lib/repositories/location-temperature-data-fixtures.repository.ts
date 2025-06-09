import type { Location } from '../entities/location'
import { LocationTemperatureDataRepository } from './location-temperature-data.repository'

const mockLocations: Location[] = [
	{
		id: '1',
		name: 'Tokyo',
		region: 'Tokyo',
		country: 'Japan',
		monthlyTemperatures: [],
	},
	{
		id: '2',
		name: 'Sydney',
		region: 'New South Wales',
		country: 'Australia',
		monthlyTemperatures: [],
	},
	{
		id: '3',
		name: 'Berlin',
		region: 'Berlin',
		country: 'Germany',
		monthlyTemperatures: [],
	},
	{
		id: '4',
		name: 'Cairo',
		region: 'Cairo',
		country: 'Egypt',
		monthlyTemperatures: [],
	},
	{
		id: '5',
		name: 'Toronto',
		region: 'Ontario',
		country: 'Canada',
		monthlyTemperatures: [],
	},
]

/**
 * Repository for Location temperature data that uses fixture data
 * Used for testing and development
 */
export class LocationTemperatureDataFixturesRepository extends LocationTemperatureDataRepository {
	constructor() {
		super('/api')
	}

	protected override toDomainEntity(resource: unknown): Location {
		return resource as Location
	}

	protected override toResource(entity: Location): unknown {
		return entity
	}

	protected override getEndpoint(): string {
		return 'locations'
	}

	override async getLocations(): Promise<Location[]> {
		// Mock implementation with fixture data
		return Promise.resolve(mockLocations)
	}

	override async calculateDate(_request: {
		locationId: string
		temperature: number
	}): Promise<Date> {
		// Mock implementation that returns a date 30 days from now
		const date = new Date()
		date.setDate(date.getDate() + 30)
		return Promise.resolve(date)
	}
}
