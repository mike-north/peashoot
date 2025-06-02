import { Entity, Column, ManyToOne } from 'typeorm'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { IPlant, IPlantPresentation } from '@peashoot/types'
import { PlantPlacement } from './plant-placement'
import { RGBColor } from '../values/color'

@Entity({ name: 'plant-presentation' })
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

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants)
	seedPacket!: SeedPacket

	@ManyToOne(() => PlantPlacement, (placement) => placement.plant)
	placements!: PlantPlacement[]

	@Column(() => PlantPresentation)
	presentation!: PlantPresentation

	@Column({ nullable: false }) name!: string
	@Column({ nullable: false }) family!: string
	@Column({ nullable: false }) description!: string
	@Column({ nullable: false }) variant!: string
	@Column({ nullable: false }) plantingDistance!: number
}
