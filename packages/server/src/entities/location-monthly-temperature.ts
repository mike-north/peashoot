import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Location } from './location'
import { TemperatureRange } from '../values/temperature-range'

@Entity()
export class LocationMonthlyTemperature {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column('integer')
	month!: number

	@Column(() => TemperatureRange)
	temperatureRange!: TemperatureRange

	@ManyToOne(() => Location, (location) => location.monthlyTemperatures, {
		onDelete: 'CASCADE',
	})
	location!: Location
}
