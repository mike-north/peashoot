import { Plant } from './entities/plant'
import { AppDataSource } from './data-source'
import * as rimraf from 'rimraf'
import { initApp } from './application/app'
import { createLogger } from './logger'

const PORT = process.env.port ?? 3000

async function main() {
	const logger = createLogger({ level: 'debug' })
	rimraf.sync('peashoot.sqlite')
	await AppDataSource.initialize()
	const repo = AppDataSource.getRepository(Plant)
	const plant = repo.create({
		name: 'Plant 1',
	})
	await repo.save(plant)
	logger.info('Plant saved', { plant, id: plant.id })
	const app = initApp()
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`)
	})
}

main().catch(console.error)
