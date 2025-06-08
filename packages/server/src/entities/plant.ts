import { Entity, Column, ManyToOne } from 'typeorm'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { IDistance, IPlant, IRGBColor } from '@peashoot/types'
import { PlantPlacement } from './plant-placement'
import { RGBColor } from '../values/rgb-color'
import { Distance } from '../values/distance'

@Entity({ name: 'plants' })
export class Plant extends PeashootEntity<'plant'> implements IPlant {
	constructor() {
		super('plant')
	}

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants, { nullable: false })
	seedPacket!: SeedPacket

	@ManyToOne(() => PlantPlacement, (placement) => placement.plant)
	placements!: PlantPlacement[]

	@Column(() => RGBColor)
	accentColor!: IRGBColor

	@Column({ nullable: false }) iconPath!: string
	@Column({ nullable: false }) variant!: string

	@Column({ nullable: false }) name!: string
	@Column({ nullable: false }) family!: string
	@Column({ nullable: false }) description!: string
	@Column(() => Distance)
	plantingDistance!: IDistance
}
