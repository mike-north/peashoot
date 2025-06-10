import { DataSource } from 'typeorm'
import { Plant } from './entities/plant'
import { SeedPacket } from './entities/seed-packet'
import { Garden } from './entities/garden'
import { RGBColor } from './values/rgb-color'
import { XYCoordinate } from './values/xy-coordinate'
import { Location } from './entities/location'
import { MonthlyTemperatureRange } from './entities/monthly-temperature-range'
import { Temperature } from './values/temperature'

export const AppDataSource = new DataSource({
	type: 'sqlite',
	database: 'peashoot.sqlite',
	synchronize: true, // For dev only; use migrations in prod
	logging: false,
	entities: [
		Plant,
		SeedPacket,
		Garden,
		Location,
		RGBColor,
		XYCoordinate,
		MonthlyTemperatureRange,
		Temperature,
	],
	migrations: [],
	subscribers: [],
})
