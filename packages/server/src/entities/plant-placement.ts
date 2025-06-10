import { Entity, Column, ManyToOne } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { GardenBed } from './garden-bed'
import { XYCoordinate } from '../values/xy-coordinate'
import { Plant } from './plant'

@Entity({ name: 'plant-placements' })
export class PlantPlacement extends PeashootEntity<'plcmnt'> {
	constructor() {
		super('plcmnt')
	}

	@ManyToOne(() => GardenBed, (gardenBed) => gardenBed.placements)
	bed!: GardenBed

	@ManyToOne(() => Plant, (plant) => plant.placements, { nullable: false })
	item!: Plant

	@Column(() => XYCoordinate)
	position!: XYCoordinate

	@Column()
	sourceZoneId!: string
}
