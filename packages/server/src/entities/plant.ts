import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from 'typeorm'
import { PlantableArea } from './plantable-area'
import { SeedPacket } from './seed-packet'

export type PlantId = string & { readonly __plant: unique symbol }

@Entity({ name: 'plants' })
export class Plant {
	@PrimaryGeneratedColumn('uuid')
	private _id!: string

	get id(): PlantId {
		return this._id as PlantId
	}

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants)
	seedPacket?: SeedPacket

	@ManyToOne(() => PlantableArea, (plantableArea) => plantableArea.plants)
	plantableArea?: PlantableArea

	@Column()
	name!: string

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
