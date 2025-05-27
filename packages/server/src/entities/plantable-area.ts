import {
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	Column,
} from 'typeorm'
import { GardenBed } from './garden-bed'
import { Plant } from './plant'

export type PlantableAreaId = string & { readonly __plantableArea: unique symbol }

@Entity({ name: 'plantable-areas' })
export class PlantableArea {
	@PrimaryGeneratedColumn('uuid')
	private _id!: string

	get id(): PlantableAreaId {
		return this._id as PlantableAreaId
	}

	@CreateDateColumn()
	createdAt!: Date

	@OneToMany(() => Plant, (plant) => plant.plantableArea)
	plants!: Plant[]

	@ManyToOne(() => GardenBed, (gardenBed) => gardenBed.plantableAreas)
	gardenBed!: GardenBed

	@UpdateDateColumn()
	updatedAt!: Date

	@Column({ type: 'int', nullable: false })
	width!: number

	@Column({ type: 'int', nullable: false })
	height!: number

	get area(): number {
		return this.width * this.height
	}
}
