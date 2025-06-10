import { parse } from 'yaml'
import * as fs from 'fs'
import { join } from 'path'
import { Logger } from 'winston'
import { RawSeedPacketInfo, RawSeedPacketInfoCollection } from '../data/raw-seed-info'
import Ajv, { AnySchema } from 'ajv'
import _, * as ld from 'lodash'
import { SeedPacket } from './entities/seed-packet'
import { AppDataSource } from './data-source'
import { Plant } from './entities/plant'
import { stringToDistanceUnit } from './values/distance'
import { Garden } from './entities/garden'
import { PlantPlacement } from './entities/plant-placement'
import { GardenBed } from './entities/garden-bed'
import { Location } from './entities/location'
import { LocationMonthlyTemperature } from './entities/location-monthly-temperature'
import { TemperatureDataSchema } from './data/temperature-data.schema'
import { JSONValue } from './types/json'

const ajv = new Ajv()

const SEED_DATA_FILE_PATH = join(__dirname, '..', 'data', 'seeds.yml')
const SEED_DATA_SCHEMA_FILE_PATH = join(
	__dirname,
	'..',
	'data',
	'seed-packet.schema.json',
)

const TEMPERATURE_DATA_FILE_PATH = join(__dirname, '..', 'data', 'temperature-ranges.yml')

export function readSeedDataFile(logger: Logger): RawSeedPacketInfo[] {
	if (!fs.existsSync(SEED_DATA_FILE_PATH)) {
		logger.error(`Seed data file not found at ${SEED_DATA_FILE_PATH}`)
	}
	if (!fs.existsSync(SEED_DATA_SCHEMA_FILE_PATH)) {
		logger.error(`Seed data schema file not found at ${SEED_DATA_SCHEMA_FILE_PATH}`)
	}
	logger.info(`Reading seed data file from ${SEED_DATA_FILE_PATH}`)
	const schema = fs.readFileSync(SEED_DATA_SCHEMA_FILE_PATH, 'utf8')
	let schemaJson: unknown
	try {
		schemaJson = JSON.parse(schema)
	} catch (error: unknown) {
		throw new Error(`Error parsing seed data schema file into JSON`, { cause: error })
	}
	const dataString = fs.readFileSync(SEED_DATA_FILE_PATH, 'utf8')
	// Parse the YAML string into a JavaScript object FIRST
	const parsedData: unknown = parse(dataString)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const valid = ajv.validate(schemaJson as any as AnySchema, parsedData)
	if (!valid) {
		logger.error(`Seed data file does not match schema: ${JSON.stringify(ajv.errors)}`)
		throw new Error(`Seed data file does not match schema`, { cause: ajv.errors })
	}
	// No need for uncheckedSeedData, as parsedData is already the result of parsing.
	// Type assertion can happen here if validation passes.
	const seedData: RawSeedPacketInfoCollection = parsedData as RawSeedPacketInfoCollection
	return seedData.seedPackets
}

export async function loadSeedsIntoDb(logger: Logger) {
	const repo = AppDataSource.getRepository(SeedPacket)
	const packets = readSeedDataFile(logger)
	for (const pkt of packets) {
		let packet = repo.create({
			name: pkt.commonName,
			description: pkt.description ?? '',
			presentation: {
				accentColor: {
					red: pkt.presentation.accentColor.red,
					green: pkt.presentation.accentColor.green,
					blue: pkt.presentation.accentColor.blue,
				},
				iconPath: `${ld.kebabCase([pkt.plantFamily, pkt.commonName].join('-'))}.png`,
			},
			category: pkt.plantFamily,
			plantingInstructions: pkt.plantingInstructions ?? '',
			quantity: pkt.seedPacketInfo?.seedCount ?? 100,
			netWeightGrams: (pkt.seedPacketInfo?.ntWeightInOz ?? 1) * 28.3495,
			originLocation: pkt.seedSource ?? 'USA',
			plantFamily: pkt.plantFamily,
			plantingDistance: {
				value: pkt.spacing.optimal.value,
				unit: stringToDistanceUnit(pkt.spacing.optimal.unit),
			},
			expiresAt: new Date(
				Date.now() +
					(pkt.seedPacketInfo?.viabilityYears ?? 1) * 365 * 24 * 60 * 60 * 1000,
			),
		})
		packet = await repo.save(packet)
		logger.info('Seed packet saved', { pkt: packet.name, id: packet.id })
	}
}

export async function generatePlants(logger: Logger) {
	const plantRepo = AppDataSource.getRepository(Plant)
	const packetRepo = AppDataSource.getRepository(SeedPacket)
	const packets = await packetRepo.find()
	logger.info(`Found ${packets.length} packets`)
	for (const packet of packets) {
		const variant = _.kebabCase(packet.name)
		const iconPath = `${packet.plantFamily}-${variant}.png`
		const plant = plantRepo.create({
			seedPacket: packet,
			name: packet.name,
			description: packet.description,
			presentation: packet.presentation,
			family: packet.plantFamily,
			plantingDistance: packet.plantingDistance,
			variant,
			iconPath,
			accentColor: packet.presentation.accentColor,
		})
		await plantRepo.save(plant)
		logger.info('Plant saved', { plant: plant.name, id: plant.id })
	}
}

async function createGarden(logger: Logger) {
	const gardenRepo = AppDataSource.getRepository(Garden)
	const bedRepo = AppDataSource.getRepository(GardenBed)
	const plantRepo = AppDataSource.getRepository(Plant)
	const plantPlacementRepo = AppDataSource.getRepository(PlantPlacement)

	let garden = gardenRepo.create({
		name: 'My Garden',
		description: 'My garden',
		beds: [],
	})
	garden = await gardenRepo.save(garden)
	logger.info('Garden saved', { garden: garden.name, id: garden.id })

	let bed1 = bedRepo.create({
		name: 'Bed 1',
		description: 'My first raised bed',
		garden,
		height: 4,
		width: 4,
	})
	bed1 = await bedRepo.save(bed1)
	logger.info('Bed saved', { bed: bed1.name, id: bed1.id })
	let bed2 = bedRepo.create({
		name: 'Bed 2',
		description: 'My second raised bed',
		garden,
		width: 4,
		height: 4,
	})
	bed2 = await bedRepo.save(bed2)
	logger.info('Bed saved', { bed: bed2.name, id: bed2.id })

	const [plant1, plant2] = await plantRepo.find({ take: 2 })

	let placement1 = plantPlacementRepo.create({
		item: plant1,
		bed: bed1,
		position: {
			x: 0,
			y: 0,
		},
		sourceZoneId: bed1.id,
	})
	placement1 = await plantPlacementRepo.save(placement1)
	logger.info('Plant placement saved', { placement: placement1.id })
	let placement2 = plantPlacementRepo.create({
		item: plant2,
		bed: bed2,
		position: {
			x: 0,
			y: 0,
		},
		sourceZoneId: bed2.id,
	})
	placement2 = await plantPlacementRepo.save(placement2)
	logger.info('Plant placement saved', { placement: placement2.id })
}

async function loadTemperatureData(logger: Logger) {
	const locationRepo = AppDataSource.getRepository(Location)
	const tempRepo = AppDataSource.getRepository(LocationMonthlyTemperature)

	if (!fs.existsSync(TEMPERATURE_DATA_FILE_PATH)) {
		logger.error(`Temperature data file not found at ${TEMPERATURE_DATA_FILE_PATH}`)
		return
	}

	const dataString = fs.readFileSync(TEMPERATURE_DATA_FILE_PATH, 'utf8')
	const parsedData = parse(dataString) as JSONValue

	try {
		const data = TemperatureDataSchema.parse(parsedData)

		for (const locData of data.locations) {
			const location = locationRepo.create({
				name: locData.name,
				region: locData.region,
				country: locData.country,
			})
			await locationRepo.save(location)

			for (const tempData of locData.monthlyTemperatures) {
				const trMin = {
					value: tempData.temperatureRange.min[0],
					unit: tempData.temperatureRange.min[1],
				}
				const trMax = {
					value: tempData.temperatureRange.max[0],
					unit: tempData.temperatureRange.max[1],
				}
				const temp = tempRepo.create({
					month: tempData.month,
					temperatureRange: {
						min: trMin,
						max: trMax,
					},
					location,
				})
				await tempRepo.save(temp)
			}
			logger.info('Location temperature data saved', { location: location.name })
		}
	} catch (error) {
		logger.error('Failed to validate temperature data', { error })
		throw new Error('Invalid temperature data format', { cause: error })
	}
}

export async function initializeNewDbWithData(logger: Logger) {
	await AppDataSource.initialize()
	await loadSeedsIntoDb(logger)
	await generatePlants(logger)
	await createGarden(logger)
	await loadTemperatureData(logger)
}
