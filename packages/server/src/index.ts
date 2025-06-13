import * as rimraf from 'rimraf'
import { initApp } from './application/app'
import { createLogger } from './logger'
import { initializeNewDbWithData } from './seed-db'
import { Logger } from 'winston'
import { join } from 'path'

const PORT = process.env.port ?? 3000
const logger = createLogger({ level: 'debug' })
const DATABASE_PATH = join(__dirname, 'peashoot.sqlite')

async function main(logger: Logger) {
	rimraf.sync(DATABASE_PATH)
	await initializeNewDbWithData(logger)
	const app = initApp(logger)
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`)
	})
}

main(logger).catch(console.error)
