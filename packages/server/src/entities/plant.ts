import { Entity, Column, ManyToOne, OneToMany } from 'typeorm'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { PlantPlacement } from './plant-placement'
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

	@OneToMany(() => PlantPlacement, (placement) => placement.item)
	placements!: PlantPlacement[]

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
