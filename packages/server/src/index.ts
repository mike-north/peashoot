import * as rimraf from 'rimraf'
import { initApp } from './application/app'
import { createLogger } from './logger'
import { initializeNewDbWithData } from './seed-db'
import { Logger } from 'winston'

const PORT = process.env.port ?? 3000
const logger = createLogger({ level: 'debug' })

async function main(logger: Logger) {
	rimraf.sync('peashoot.sqlite')
	await initializeNewDbWithData(logger)
	const app = initApp(logger)
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`)
	})
}

main(logger).catch(console.error)
