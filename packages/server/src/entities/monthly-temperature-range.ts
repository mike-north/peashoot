import { Column, Entity, ManyToOne } from 'typeorm'
import { MonthlyTemperatureRange as IMonthlyTemperatureRange } from '@peashoot/types'
import { Temperature } from '../values/temperature'
import { Location } from './location'

@Entity()
export class MonthlyTemperatureRange extends IMonthlyTemperatureRange {
	@Column()
	month!: number

	@ManyToOne(() => Location, (location) => location.monthlyTemps)
	location!: Location

	@Column(() => Temperature)
	min!: Temperature
	@Column(() => Temperature)
	max!: Temperature
}
