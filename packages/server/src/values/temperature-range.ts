import { Column } from 'typeorm'
import { Temperature } from './temperature.js'
import { TemperatureRange as ITemperatureRange } from '@peashoot/types'

export class TemperatureRange implements ITemperatureRange {
	@Column('json')
	min!: Temperature

	@Column('json')
	max!: Temperature
}
