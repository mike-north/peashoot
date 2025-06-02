import { parse } from 'yaml'
import * as fs from 'fs'
import { join } from 'path'
import { Logger } from 'winston'
import { RawSeedPacketInfo, RawSeedPacketInfoCollection } from '../data/raw-seed-info'
import Ajv, { AnySchema } from 'ajv'
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
