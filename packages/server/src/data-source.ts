import { DataSource } from 'typeorm'
import { Plant } from './entities/plant'
import { GardenBed } from './entities/garden-bed'
import { SeedPacket } from './entities/seed-packet'
import { PlantPlacement } from './entities/plant-placement'
import { Garden } from './entities/garden'
import { RGBColor } from './values/rgb-color'
import { XYCoordinate } from './values/xy-coordinate'
import { Location } from './entities/location'
import { LocationMonthlyTemperature } from './entities/location-monthly-temperature'
import { TemperatureRange } from './values/temperature-range'

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
		Location,
		LocationMonthlyTemperature,
		RGBColor,
		XYCoordinate,
		TemperatureRange,
	],
	migrations: [],
	subscribers: [],
})
