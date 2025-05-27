import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { PlantableArea, PlantableAreaId } from './plantable-area'

export type GardenBedId = string & { readonly __gardenBed: unique symbol }

@Entity({ name: 'garden-beds' })
export class GardenBed {
	@PrimaryGeneratedColumn('uuid')
	private _id!: string

	get id(): GardenBedId {
		return this._id as GardenBedId
	}

	@Column()
	name!: string

	@OneToMany(() => PlantableArea, (plantableArea) => plantableArea.gardenBed)
	plantableAreas!: PlantableArea[]

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
