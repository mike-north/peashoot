import { Entity, Column, OneToMany } from 'typeorm'
import { Plant } from './plant'
import { PeashootEntity } from './peashoot-entity'
import { Distance } from '../values/distance'
import { Presentation } from './presentation'

@Entity({ name: 'seed-packets' })
export class SeedPacket extends PeashootEntity<'spkt'> {
	constructor() {
		super('spkt')
	}

	@OneToMany(() => Plant, (plant) => plant.seedPacket)
	plants!: Plant[]

	@Column()
	name!: string

	@Column({ nullable: false })
	description!: string

	@Column()
	quantity!: number

	@Column()
	category!: string

	@Column()
	netWeightGrams!: number

	@Column()
	originLocation!: string

	@Column()
	plantingInstructions!: string

	@Column()
	plantFamily!: string

	@Column(() => Presentation)
	presentation!: Presentation

	@Column()
	expiresAt!: Date

	@Column(() => Distance)
	plantingDistance!: Distance
}
