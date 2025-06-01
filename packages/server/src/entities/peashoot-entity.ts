import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export type BaseEntityId<Prefix extends string> = `${Prefix}_${string}`

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class PeashootEntity<Prefix extends string> {
	@PrimaryGeneratedColumn('uuid')
	protected _id!: string

	abstract get id(): BaseEntityId<Prefix>

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
