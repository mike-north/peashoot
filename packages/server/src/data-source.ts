import { DataSource } from 'typeorm'
import { Plant, PlantPresentation } from './entities/plant'
import { GardenBed } from './entities/garden-bed'
import { SeedPacket } from './entities/seed-packet'
import { PlantPlacement } from './entities/plant-placement'
import { Garden } from './entities/garden'
import { RGBColor } from './values/color'
import { XYCoordinate } from './values/xy-coordinate'

export const AppDataSource = new DataSource({
	type: 'sqlite',
	database: 'peashoot.sqlite',
	synchronize: true, // For dev only; use migrations in prod
	logging: false,
	entities: [
		Plant,
		PlantPlacement,
		SeedPacket,
		GardenBed,
		Garden,
		PlantPresentation,
		RGBColor,
		XYCoordinate,
	],
	migrations: [],
	subscribers: [],
})
