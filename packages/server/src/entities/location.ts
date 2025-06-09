import { Entity, Column, OneToMany, JoinColumn } from 'typeorm'
import { LocationMonthlyTemperature } from './location-monthly-temperature'
import { PeashootEntity } from './peashoot-entity'

@Entity()
export class Location extends PeashootEntity<'loc'> {
	constructor() {
		super('loc')
	}

	@Column('text')
	name!: string

	@Column('text')
	region!: string

	@Column('text')
	country!: string

	@OneToMany(() => LocationMonthlyTemperature, (temp) => temp.location)
	@JoinColumn()
	monthlyTemperatures!: LocationMonthlyTemperature[]
}
