import { Logger } from 'winston'
import { AppDataSource } from '../data-source'
import { Location } from '../entities/location'
import * as fs from 'fs'
import { join } from 'path'
import { JSONValue } from '../types/json'
import { parse } from 'yaml'
import { file, z } from 'zod/v4'
import { MonthlyTemperatureRange } from '../entities/monthly-temperature-range'
import { DeepPartial } from 'typeorm'
import { TemperatureUnitSchema } from '@peashoot/types'

const TEMPERATURE_DATA_FILE_PATH = join(
	__dirname,
	'..',
	'..',
	'data',
	'temperature-ranges.yml',
)

// - month: 1
// temperatureRange:
// 	min: [5.2, "C"]
// 	max: [8.3, "C"]
const LocationFileData = z.object({
	locations: z.array(
		z.object({
			name: z.string(),
			region: z.string(),
			country: z.string(),
			monthlyTemperatures: z.array(
				z.object({
					month: z.int(),
					temperatureRange: z.object({
						min: z.tuple([z.number(), TemperatureUnitSchema]),
						max: z.tuple([z.number(), TemperatureUnitSchema]),
					}),
				}),
			),
		}),
	),
})

export async function loadTemperatureData(logger: Logger) {
	if (!fs.existsSync(TEMPERATURE_DATA_FILE_PATH)) {
		logger.error(`Temperature data file not found at ${TEMPERATURE_DATA_FILE_PATH}`)
		return
	}

	try {
		const dataString = fs.readFileSync(TEMPERATURE_DATA_FILE_PATH, 'utf8')
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const parsedData = parse(dataString) as JSONValue

		// console.log(parsedData)
		const fileData = LocationFileData.parse(parsedData)
		// TODO: Parse temperature data into some model
		const locRepo = AppDataSource.getRepository(Location)
		const mtRepo = AppDataSource.getRepository(MonthlyTemperatureRange)
		const locations: Location[] = []

		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < fileData.locations.length; i++) {
			const locData = fileData.locations[i]
			const l = locRepo.create({
				name: locData.name,
				region: locData.region,
				country: locData.country,
			})
			const loc = await locRepo.save(l)
			locations.push(loc)
			for (const monthData of locData.monthlyTemperatures) {
				const [minValue, minUnit] = monthData.temperatureRange.min
				const [maxValue, maxUnit] = monthData.temperatureRange.max
				const locMt = mtRepo.create({
					location: loc,
					month: monthData.month - 1,
					min: {
						value: minValue,
						unit: minUnit,
					},
					max: {
						value: maxValue,
						unit: maxUnit,
					},
				} satisfies DeepPartial<MonthlyTemperatureRange>)
				await mtRepo.save(locMt)
			}
		}

		return locations
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
		const locations = await this.locationRepository.find()
		// console.log({ locations })
		return locations
	}

	async calculateDate(
		locationId: string,
		temperature: { value: number; unit: 'C' | 'F' },
	): Promise<Date> {
		// console.log({
		// 	locationId,
		// 	temperature,
		// })
		const location = await this.locationRepository.findOne({
			where: { id: locationId as `loc_${string}` },
			relations: { monthlyTemps: true },
		})
		if (!location) {
			throw new Error(`Location with id ${locationId} not found`)
		}
		for (const mt of location.monthlyTemps) {
			if (mt.min.value > temperature.value) {
				return new Date(2025, mt.month, 1)
			}
		}
		// TODO: Implement the actual calculation
		return new Date(2025, 11, 31) // Default to December 31, 2025
	}
}
