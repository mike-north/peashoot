import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

const generatePrefixedUUID = <P extends string>(prefix: P): `${P}_${string}` => {
	return `${prefix}_${uuidv4().slice(prefix.length)}`
}

export type BaseEntityId<Prefix extends string> = `${Prefix}_${string}`

@Entity({ name: 'peashoot-entities' })
export abstract class PeashootEntity<Prefix extends string> {
	constructor(idPrefix: Prefix) {
		this.id = generatePrefixedUUID(idPrefix)
	}

	@PrimaryColumn({
		name: 'id',
		unique: true,
	})
	id!: BaseEntityId<Prefix>

	@CreateDateColumn()
	createdAt!: Date

	@UpdateDateColumn()
	updatedAt!: Date
}
