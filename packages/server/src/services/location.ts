import { AppDataSource } from '../data-source'
import { Location } from '../entities/location'
import type Temperature from '../values/temperature'
// import { toCelsius } from '../values/temperature'

export class LocationService {
	private locationRepository = AppDataSource.getRepository(Location)

	async getLocation(id: string): Promise<Location> {
		const location = await this.locationRepository.findOne({
			where: { id: `loc_${id}` },
			relations: ['monthlyTemperatures'],
		})
		if (!location) {
			throw new Error(`Location with id ${id} not found`)
		}
		return location
	}

	async getAllLocations(): Promise<Location[]> {
		return this.locationRepository.find()
	}

	async calculateDate(locationId: string, _temperature: Temperature): Promise<Date> {
		const location = await this.locationRepository.findOne({
			where: { id: locationId as `loc_${string}` },
			relations: ['monthlyTemperatures'],
		})
		if (!location) {
			throw new Error(`Location with id ${locationId} not found`)
		}
		// TODO: Implement the actual calculation
		return new Date(2025, 11, 31) // Default to December 31, 2025
	}
}
