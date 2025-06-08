import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm'
import { LocationMonthlyTemperature } from './location-monthly-temperature'

@Entity()
export class Location {
	@PrimaryGeneratedColumn('uuid')
	id!: string

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
