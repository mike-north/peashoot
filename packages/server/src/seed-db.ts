import { parse } from 'yaml'
import * as fs from 'fs'
import { join } from 'path'
import { Logger } from 'winston'
import { RawSeedPacketInfo, RawSeedPacketInfoCollection } from '../data/raw-seed-info'
import Ajv, { AnySchema } from 'ajv'
import _, * as ld from 'lodash'
import { SeedPacket } from './entities/seed-packet'
import { AppDataSource } from './data-source'
import {
	GardenBedSchema,
	GardenSchema,
	PlantPlacementSchema,
	PlantSchema,
	SeedPacketSchema,
} from '@peashoot/types'
import { Plant } from './entities/plant'
import { stringToDistanceUnit } from './values/distance'
import { Garden } from './entities/garden'
import { PlantPlacement } from './entities/plant-placement'
import { GardenBed } from './entities/garden-bed'

const ajv = new Ajv()

const SEED_DATA_FILE_PATH = join(__dirname, '..', 'data', 'seeds.yml')
const SEED_DATA_SCHEMA_FILE_PATH = join(
	__dirname,
	'..',
	'data',
	'seed-packet.schema.json',
)

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
		const seedPacketParams = SeedPacketSchema.parse({
			name: pkt.commonName,
			description: pkt.description ?? '',
			iconPath: `${ld.kebabCase([pkt.plantFamily, pkt.commonName].join('-'))}.png`,
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
			presentation: {
				accentColor: {
					red: pkt.presentation.accentColor.red,
					green: pkt.presentation.accentColor.green,
					blue: pkt.presentation.accentColor.blue,
				},
				iconPath: pkt.presentation.iconPath,
			},
		})
		let packet = repo.create(seedPacketParams)
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
		const plantParams = PlantSchema.parse({
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
		const plant = plantRepo.create(plantParams)
		await plantRepo.save(plant)
		logger.info('Plant saved', { plant: plant.name, id: plant.id })
	}
}

async function createGarden(logger: Logger) {
	const gardenRepo = AppDataSource.getRepository(Garden)
	const bedRepo = AppDataSource.getRepository(GardenBed)
	const plantRepo = AppDataSource.getRepository(Plant)
	const plantPlacementRepo = AppDataSource.getRepository(PlantPlacement)

	const gardenParams = GardenSchema.parse({
		name: 'My Garden',
		description: 'My garden',
		beds: [],
	})
	let garden = gardenRepo.create(gardenParams)
	garden = await gardenRepo.save(garden)
	logger.info('Garden saved', { garden: garden.name, id: garden.id })

	const bedParams1 = GardenBedSchema.parse({
		name: 'Bed 1',
		description: 'My first raised bed',
		garden,
		rows: 4,
		columns: 4,
	})
	let bed1 = bedRepo.create(bedParams1)
	bed1 = await bedRepo.save(bed1)
	logger.info('Bed saved', { bed: bed1.name, id: bed1.id })
	const bedParams2 = GardenBedSchema.parse({
		name: 'Bed 2',
		description: 'My second raised bed',
		garden,
		rows: 4,
		columns: 4,
	})
	let bed2 = bedRepo.create(bedParams2)
	bed2 = await bedRepo.save(bed2)
	logger.info('Bed saved', { bed: bed2.name, id: bed2.id })

	const [plant1, plant2] = await plantRepo.find({ take: 2 })

	const plantPlacement1Params = PlantPlacementSchema.parse({
		plant: plant1,
		bed: bed1,
		position: {
			x: 0,
			y: 0,
		},
	})

	const plantPlacement2Params = PlantPlacementSchema.parse({
		plant: plant2,
		bed: bed2,
		position: {
			x: 0,
			y: 0,
		},
	})
	let placement1 = plantPlacementRepo.create(plantPlacement1Params)
	placement1 = await plantPlacementRepo.save(placement1)
	logger.info('Plant placement saved', { placement: placement1.id })
	let placement2 = plantPlacementRepo.create(plantPlacement2Params)
	placement2 = await plantPlacementRepo.save(placement2)
	logger.info('Plant placement saved', { placement: placement2.id })
}

export async function initializeNewDbWithData(logger: Logger) {
	await AppDataSource.initialize()
	await loadSeedsIntoDb(logger)
	await generatePlants(logger)
	await createGarden(logger)
}
