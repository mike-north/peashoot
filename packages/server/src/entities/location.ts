import { Entity, Column, OneToMany } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { MonthlyTemperatureRange } from './monthly-temperature-range'

@Entity()
export class Location extends PeashootEntity<'loc'> {
	constructor() {
		super('loc')
	}

	@OneToMany(
		() => MonthlyTemperatureRange, // create the record
		(range) => range.location,
	) // walk the association
	monthlyTemps!: MonthlyTemperatureRange[]

	@Column('text')
	name!: string

	@Column('text')
	region!: string

	@Column('text')
	country!: string
}
