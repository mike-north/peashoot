import { Entity, Column, OneToMany } from 'typeorm'
import { Plant } from './plant'
import { PeashootEntity } from './peashoot-entity'
import { ISeedPacket, ISeedPacketPresentation } from '@peashoot/types'
import { RGBColor } from '../values/color'

@Entity()
export class SeedPacketPresentation implements ISeedPacketPresentation {
	@Column(() => RGBColor)
	accentColor!: RGBColor

	@Column()
	iconPath!: string
}

@Entity({ name: 'seed-packets' })
export class SeedPacket extends PeashootEntity<'spkt'> implements ISeedPacket {
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
	netWeightGrams!: number

	@Column()
	originLocation!: string

	@Column()
	plantingInstructions!: string

	@Column(() => SeedPacketPresentation)
	presentation!: SeedPacketPresentation

	@Column()
	expiresAt!: Date
}
