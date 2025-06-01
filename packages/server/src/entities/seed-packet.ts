import { Entity, Column, OneToMany } from 'typeorm'
import { Plant } from './plant'
import { PeashootEntity } from './peashoot-entity'

export type SeedPacketId = string & { readonly __seedPacket: unique symbol }

@Entity({ name: 'seed-packets' })
export class SeedPacket extends PeashootEntity<'spkt'> {
	get id() {
		return `spkt_${this._id}` as const
	}

	@OneToMany(() => Plant, (plant) => plant.seedPacket)
	plants!: Plant[]

	@Column()
	plantName!: string

	@Column()
	quantity!: number

	@Column()
	expiresAt!: Date
}
