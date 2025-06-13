import 'reflect-metadata' // This must be the first import
import * as rimraf from 'rimraf'
import { initApp } from './application/app.js'
import { createLogger } from './logger.js'
import { initializeNewDbWithData } from './seed-db.js'
import { Logger } from 'winston'
import { DATABASE_PATH } from './paths.js'

const PORT = process.env.port ?? 3000
const logger = createLogger({ level: 'debug' })

async function main(logger: Logger) {
	rimraf.sync(DATABASE_PATH)
	await initializeNewDbWithData(logger)
	const app = initApp(logger)
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`)
	})
}

main(logger).catch(console.error)
