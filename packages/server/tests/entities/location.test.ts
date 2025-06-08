import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { DataSource } from 'typeorm'
import { Location } from '../../src/entities/location'
import { LocationMonthlyTemperature } from '../../src/entities/location-monthly-temperature'
import { TemperatureRange } from '../../src/values/temperature-range'

describe('Location Entity', () => {
	let dataSource: DataSource

	beforeAll(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			dropSchema: true,
			entities: [Location, LocationMonthlyTemperature, TemperatureRange],
			synchronize: true,
			logging: false,
		})
		await dataSource.initialize()
	})

	afterAll(async () => {
		await dataSource.destroy()
	})

	beforeEach(async () => {
		await dataSource.synchronize(true)
	})

	it('should create a location with basic properties', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const location = locationRepo.create({
			name: 'San Francisco',
			region: 'CA',
			country: 'USA',
		})

		const savedLocation = await locationRepo.save(location)
		expect(savedLocation.id).toBeDefined()
		expect(savedLocation.name).toBe('San Francisco')
		expect(savedLocation.region).toBe('CA')
		expect(savedLocation.country).toBe('USA')
	})

	it('should create a location with monthly temperatures', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const tempRepo = dataSource.getRepository(LocationMonthlyTemperature)

		const location = locationRepo.create({
			name: 'San Francisco',
			region: 'CA',
			country: 'USA',
		})
		const savedLocation = await locationRepo.save(location)

		const temp = tempRepo.create({
			month: 1,
			temperatureRange: {
				min: [8.3, 'C'],
				max: [13.9, 'C'],
			},
			location: savedLocation,
		})
		await tempRepo.save(temp)

		const loadedLocation = await locationRepo.findOne({
			where: { id: savedLocation.id },
			relations: ['monthlyTemperatures'],
		})

		expect(loadedLocation?.monthlyTemperatures).toHaveLength(1)
		expect(loadedLocation?.monthlyTemperatures[0].month).toBe(1)
		expect(loadedLocation?.monthlyTemperatures[0].temperatureRange.min).toEqual([
			8.3,
			'C',
		])
		expect(loadedLocation?.monthlyTemperatures[0].temperatureRange.max).toEqual([
			13.9,
			'C',
		])
	})

	it('should cascade delete monthly temperatures when location is deleted', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const tempRepo = dataSource.getRepository(LocationMonthlyTemperature)

		const location = locationRepo.create({
			name: 'San Francisco',
			region: 'CA',
			country: 'USA',
		})
		const savedLocation = await locationRepo.save(location)

		const temp = tempRepo.create({
			month: 1,
			temperatureRange: {
				min: [8.3, 'C'],
				max: [13.9, 'C'],
			},
			location: savedLocation,
		})
		await tempRepo.save(temp)

		await locationRepo.remove(savedLocation)

		const remainingTemps = await tempRepo.find()
		expect(remainingTemps).toHaveLength(0)
	})
})
