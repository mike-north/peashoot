import { Entity, Column, ManyToOne } from 'typeorm'
import { SeedPacket } from './seed-packet.js'
import { PeashootEntity } from './peashoot-entity.js'
import { RGBColor } from '../values/rgb-color.js'
import { Distance } from '../values/distance.js'
import { Presentation } from './presentation.js'

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
