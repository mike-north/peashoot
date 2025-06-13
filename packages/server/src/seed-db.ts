import { parse } from 'yaml'
import * as fs from 'fs'
import { join } from 'path'
import { Logger } from 'winston'
import { RawSeedPacketInfo, RawSeedPacketInfoCollection } from './data/raw-seed-info'
import Ajv, { AnySchema } from 'ajv'
import { SeedPacket } from './entities/seed-packet'
import { AppDataSource } from './data-source'
import { Plant } from './entities/plant'
import { SeedPacketsService } from './services/seed-packets-service'
import { PlantsService } from './services/plants-service'
import { GardensService } from './services/gardens-service'
import { loadTemperatureData } from './services/location'

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
	const seedPacketsService = new SeedPacketsService()
	const packets = readSeedDataFile(logger)
	for (const pkt of packets) {
		const packet = await repo.save(seedPacketsService.parseSeedPacket(repo, pkt))
	}
	logger.info(`${packets.length} seed packets saved`)
}

export async function generatePlants(logger: Logger) {
	const plantRepo = AppDataSource.getRepository(Plant)
	const packetRepo = AppDataSource.getRepository(SeedPacket)
	const plantsService = new PlantsService()
	const packets = await packetRepo.find()
	logger.info(`Found ${packets.length} packets`)
	for (const packet of packets) {
		const plant = await plantRepo.save(
			plantsService.generatePlantFromSeedPacket(plantRepo, packet),
		)
	}
	logger.info(`${packets.length} plants saved`)
}

export async function initializeNewDbWithData(logger: Logger) {
	await AppDataSource.initialize()
	const gardensService = new GardensService()
	await loadSeedsIntoDb(logger)
	await generatePlants(logger)
	await gardensService.createExampleGarden(logger)
	await loadTemperatureData(logger)
}
