import { Entity, Column, ManyToOne } from 'typeorm'
import { Location } from './location'
import { TemperatureRange } from '../values/temperature-range'
import { PeashootEntity } from './peashoot-entity'

@Entity()
export class LocationMonthlyTemperature extends PeashootEntity<'loctemp'> {
	constructor() {
		super('loctemp')
	}

	@Column('integer')
	month!: number

	@Column(() => TemperatureRange)
	temperatureRange!: TemperatureRange

	@ManyToOne(() => Location, (location) => location.monthlyTemperatures, {
		onDelete: 'CASCADE',
	})
	location!: Location
}
