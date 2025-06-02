import { Entity, Column, ManyToOne } from 'typeorm'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { IDistance, IPlant, IPlantPresentation } from '@peashoot/types'
import { PlantPlacement } from './plant-placement'
import { RGBColor } from '../values/rgb-color'
import { Distance } from '../values/distance'

export class PlantPresentation implements IPlantPresentation {
	@Column(() => RGBColor)
	accentColor!: RGBColor

	@Column()
	iconPath!: string
}

@Entity({ name: 'plants' })
export class Plant extends PeashootEntity<'plant'> implements IPlant {
	constructor() {
		super('plant')
	}

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants, { nullable: false })
	seedPacket!: SeedPacket

	@ManyToOne(() => PlantPlacement, (placement) => placement.plant)
	placements!: PlantPlacement[]

	@Column(() => PlantPresentation)
	presentation!: PlantPresentation

	@Column({ nullable: false }) name!: string
	@Column({ nullable: false }) family!: string
	@Column({ nullable: false }) description!: string
	@Column(() => Distance)
	plantingDistance!: IDistance
}
