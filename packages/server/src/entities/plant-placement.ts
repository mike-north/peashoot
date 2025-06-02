import { Entity, Column, ManyToOne } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { IPlantPlacement } from '@peashoot/types'
import { GardenBed } from './garden-bed'
import { Plant } from './plant'
import { XYCoordinate } from '../values/xy-coordinate'

@Entity({ name: 'plant-placements' })
export class PlantPlacement extends PeashootEntity<'plcmnt'> implements IPlantPlacement {
	constructor() {
		super('plcmnt')
	}

	@ManyToOne(() => GardenBed, (gardenBed) => gardenBed.plantPlacements)
	bed!: GardenBed

	@ManyToOne(() => Plant, (plant) => plant.placements, { nullable: false })
	plant!: Plant

	@Column(() => XYCoordinate)
	position!: XYCoordinate
}
