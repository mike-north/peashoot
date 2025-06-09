import { AppDataSource } from '../data-source'
import { Location } from '../entities/location'
import type Temperature from '../values/temperature'
import { toCelsius } from '../values/temperature'

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

	async calculateDate(locationId: string, temperature: Temperature): Promise<Date> {
		const location = await this.locationRepository.findOne({
			where: { id: locationId as `loc_${string}` },
			relations: ['monthlyTemperatures'],
		})
		if (!location) {
			throw new Error(`Location with id ${locationId} not found`)
		}
		const targetTemp = toCelsius(temperature)
		for (const monthlyTemp of location.monthlyTemperatures) {
			const minTemp = toCelsius(monthlyTemp.temperatureRange.min)
			const maxTemp = toCelsius(monthlyTemp.temperatureRange.max)
			if (targetTemp >= minTemp && targetTemp <= maxTemp) {
				// Get the next month's temperature for interpolation
				const nextMonth = location.monthlyTemperatures.find(
					(t) => t.month === (monthlyTemp.month % 12) + 1,
				)
				if (!nextMonth) {
					// If no next month data, return first day of current month
					return new Date(2025, monthlyTemp.month - 1, 1)
				}

				// Calculate the day of the month using linear interpolation
				const nextMonthMinTemp = toCelsius(nextMonth.temperatureRange.min)
				const tempDiff = nextMonthMinTemp - minTemp
				const targetDiff = targetTemp - minTemp
				const ratio = targetDiff / tempDiff
				const day = Math.round(ratio * 30) // Assuming 30 days per month for simplicity

				const date = new Date(2025, monthlyTemp.month - 1, Math.max(1, Math.min(30, day)))
				return date
			}
		}
		return new Date(2025, 11, 31) // Default to December 31, 2025
	}
}
