import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { DataSource } from 'typeorm'
import { Location } from '../../src/entities/location'
import { LocationMonthlyTemperature } from '../../src/entities/location-monthly-temperature'
import { TemperatureRange } from '../../src/values/temperature-range'

describe('LocationMonthlyTemperature Entity', () => {
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

	it('should create a monthly temperature record', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const tempRepo = dataSource.getRepository(LocationMonthlyTemperature)

		const location = await locationRepo.save(
			locationRepo.create({
				name: 'Tokyo',
				region: 'Tokyo',
				country: 'Japan',
			}),
		)

		const temp = tempRepo.create({
			month: 1,
			temperatureRange: {
				min: [8.3, 'C'],
				max: [13.9, 'C'],
			},
			location,
		})

		const savedTemp = await tempRepo.save(temp)
		expect(savedTemp.id).toBeDefined()
		expect(savedTemp.month).toBe(1)
		expect(savedTemp.temperatureRange.min).toEqual([8.3, 'C'])
		expect(savedTemp.temperatureRange.max).toEqual([13.9, 'C'])
	})

	it('should load temperature with its location', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const tempRepo = dataSource.getRepository(LocationMonthlyTemperature)

		const location = await locationRepo.save(
			locationRepo.create({
				name: 'Sydney',
				region: 'New South Wales',
				country: 'Australia',
			}),
		)

		const temp = await tempRepo.save(
			tempRepo.create({
				month: 1,
				temperatureRange: {
					min: [8.3, 'C'],
					max: [13.9, 'C'],
				},
				location,
			}),
		)

		const loadedTemp = await tempRepo.findOne({
			where: { id: temp.id },
			relations: ['location'],
		})

		expect(loadedTemp?.location).toBeDefined()
		expect(loadedTemp?.location.name).toBe('Sydney')
	})

	it('should validate temperature range structure', async () => {
		const locationRepo = dataSource.getRepository(Location)
		const tempRepo = dataSource.getRepository(LocationMonthlyTemperature)

		const location = await locationRepo.save(
			locationRepo.create({
				name: 'Berlin',
				region: 'Berlin',
				country: 'Germany',
			}),
		)

		const temp = tempRepo.create({
			month: 1,
			temperatureRange: {
				min: [8.3, 'C'],
				max: [13.9, 'C'],
			},
			location,
		})

		const savedTemp = await tempRepo.save(temp)
		const loadedTemp = await tempRepo.findOne({
			where: { id: savedTemp.id },
		})

		expect(loadedTemp?.temperatureRange).toBeInstanceOf(Object)
		expect(Array.isArray(loadedTemp?.temperatureRange.min)).toBe(true)
		expect(Array.isArray(loadedTemp?.temperatureRange.max)).toBe(true)
		expect(loadedTemp?.temperatureRange.min[1]).toBe('C')
		expect(loadedTemp?.temperatureRange.max[1]).toBe('C')
	})
})
