import { Entity, Column, ManyToOne } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { IPlantPlacement } from '@peashoot/types'
import { GardenBed } from './garden-bed'
import { Plant } from './plant'
import { XYCoordinate } from '../values/xy-coordinate'

@Entity({ name: 'plants' })
export class PlantPlacement extends PeashootEntity<'plant'> implements IPlantPlacement {
	constructor() {
		super('plant')
	}

	@ManyToOne(() => GardenBed, (gardenBed) => gardenBed.plantPlacements)
	gardenBed!: GardenBed

	@ManyToOne(() => Plant, (plant) => plant.placements)
	plant!: Plant

	@Column(() => XYCoordinate)
	position!: XYCoordinate
}
