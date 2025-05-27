import { DataSource } from 'typeorm'
import { Plant } from './entities/plant'
import { GardenBed } from './entities/garden-bed'
import { SeedPacket } from './entities/seed-packet'
import { PlantableArea } from './entities/plantable-area'

export const AppDataSource = new DataSource({
	type: 'sqlite',
	database: 'peashoot.sqlite',
	synchronize: true, // For dev only; use migrations in prod
	logging: false,
	entities: [Plant, PlantableArea, SeedPacket, GardenBed],
	migrations: [],
	subscribers: [],
})
