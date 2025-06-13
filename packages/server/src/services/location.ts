import { Logger } from 'winston'
import { AppDataSource } from '../data-source.js'
import { Location } from '../entities/location.js'
import * as fs from 'fs'
import { join } from 'path'
import { JSONValue } from '../types/json.js'
import { parse } from 'yaml'

const TEMPERATURE_DATA_FILE_PATH = join(
	__dirname,
	'..',
	'..',
	'data',
	'temperature-ranges.yml',
)

export async function loadTemperatureData(logger: Logger) {
	if (!fs.existsSync(TEMPERATURE_DATA_FILE_PATH)) {
		logger.error(`Temperature data file not found at ${TEMPERATURE_DATA_FILE_PATH}`)
		return
	}

	try {
		const dataString = fs.readFileSync(TEMPERATURE_DATA_FILE_PATH, 'utf8')
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const parsedData = parse(dataString) as JSONValue

		// TODO: Parse temperature data into some model

		return await Promise.resolve(null)
	} catch (error) {
		logger.error('Failed to validate temperature data', { error })
		throw new Error('Invalid temperature data format', { cause: error })
	}
}

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

	async calculateDate(
		locationId: string,
		_temperature: { value: number; unit: 'C' | 'F' },
	): Promise<Date> {
		const location = await this.locationRepository.findOne({
			where: { id: locationId as `loc_${string}` },
		})
		if (!location) {
			throw new Error(`Location with id ${locationId} not found`)
		}
		// TODO: Implement the actual calculation
		return new Date(2025, 11, 31) // Default to December 31, 2025
	}
}
