import { Entity, Column, ManyToOne } from 'typeorm'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { RGBColor } from '../values/rgb-color'
import { Distance } from '../values/distance'
import { Presentation } from './presentation'

@Entity({ name: 'plants' })
export class Plant extends PeashootEntity<'plant'> {
	constructor() {
		super('plant')
	}

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants, { nullable: false })
	seedPacket!: SeedPacket

	@Column(() => RGBColor)
	accentColor!: RGBColor

	@Column({ nullable: false }) iconPath!: string
	@Column({ nullable: false }) variant!: string

	@Column({ nullable: false }) name!: string
	@Column({ nullable: false }) family!: string
	@Column({ nullable: false }) description!: string
	@Column(() => Distance)
	plantingDistance!: Distance

	@Column(() => Presentation)
	presentation!: Presentation
}
