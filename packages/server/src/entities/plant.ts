import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm'

export type PlantId = string & { readonly __brand: unique symbol }

@Entity({ name: 'plants' })
export class Plant {
	@PrimaryGeneratedColumn('uuid')
	private _id!: string

	get id(): PlantId {
		return this._id as PlantId
	}

	@Column()
	name!: string

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
