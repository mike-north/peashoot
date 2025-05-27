import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm'
import { Plant } from './plant'

export type SeedPacketId = string & { readonly __seedPacket: unique symbol }

@Entity({ name: 'seed-packets' })
export class SeedPacket {
	@PrimaryGeneratedColumn('uuid')
	private _id!: string

	get id(): SeedPacketId {
		return this._id as SeedPacketId
	}

	@OneToMany(() => Plant, (plant) => plant.seedPacket)
	plants!: Plant[]

	@Column()
	plantName!: string

	@Column()
	quantity!: number

	@Column()
	expiresAt!: Date

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
