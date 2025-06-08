import { Column } from 'typeorm'
import Temperature from './temperature'

export interface ITemperatureRange {
	min: Temperature
	max: Temperature
}

export class TemperatureRange implements ITemperatureRange {
	@Column('json')
	min!: Temperature

	@Column('json')
	max!: Temperature
}
