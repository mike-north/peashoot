import { Column, Entity, ManyToOne } from 'typeorm'
import { Temperature } from '../values/temperature'
import { Location } from './location'
import { PeashootEntity } from './peashoot-entity'

@Entity()
// implements IMonthlyTemperatureRange
export class MonthlyTemperatureRange extends PeashootEntity<'mtr'> {
	constructor() {
		super('mtr')
	}

	@Column()
	month!: number

	@ManyToOne(() => Location, (location) => location.monthlyTemps)
	location!: Location

	@Column(() => Temperature)
	min!: Temperature
	@Column(() => Temperature)
	max!: Temperature
}
