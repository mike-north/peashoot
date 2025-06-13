import { join } from 'path'
import { pkgUpSync } from 'pkg-up'

const PACKAGE_JSON_PATH = pkgUpSync()
if (!PACKAGE_JSON_PATH) {
	throw new Error('Could not find package root')
}
const PACKAGE_ROOT = join(PACKAGE_JSON_PATH, '..')

export const DATABASE_PATH = join(PACKAGE_ROOT, 'peashoot.sqlite')
export const SEED_DATA_FILE_PATH = join(PACKAGE_ROOT, 'data', 'seeds.yml')
export const SEED_DATA_SCHEMA_FILE_PATH = join(
	PACKAGE_ROOT,
	'data',
	'seed-packet.schema.json',
)

export const TEMPERATURE_DATA_FILE_PATH = join(
	PACKAGE_ROOT,
	'data',
	'temperature-ranges.yml',
)