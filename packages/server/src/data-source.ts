import { DataSource } from 'typeorm'
import { Plant } from './entities/plant'

export const AppDataSource = new DataSource({
	type: 'sqlite',
	database: 'peashoot.sqlite',
	synchronize: true, // For dev only; use migrations in prod
	logging: false,
	entities: [Plant],
	migrations: [],
	subscribers: [],
})
