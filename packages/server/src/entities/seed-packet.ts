import { Entity, Column, OneToMany } from 'typeorm'
import { Plant } from './plant.js'
import { PeashootEntity } from './peashoot-entity.js'
import { Distance } from '../values/distance.js'
import { Presentation } from './presentation.js'

@Entity({ name: 'seed-packets' })
export class SeedPacket extends PeashootEntity<'spkt'> {
	constructor() {
		super('spkt')
	}

	@OneToMany(() => Plant, (plant) => plant.seedPacket)
	plants!: Plant[]

	@Column('text')
	name!: string

	@Column({type: 'text', nullable: false })
	description!: string

	@Column('int')
	quantity!: number

	@Column('text')
	category!: string

	@Column(() => Presentation)
	presentation!: Presentation

	@Column(() => Distance)
	plantingDistance!: Distance
}
