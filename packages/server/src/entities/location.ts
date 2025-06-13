import { Entity, Column } from 'typeorm'
import { PeashootEntity } from './peashoot-entity.js'

@Entity()
export class Location extends PeashootEntity<'loc'> {
	constructor() {
		super('loc')
	}

	@Column('text')
	name!: string

	@Column('text')
	region!: string

	@Column('text')
	country!: string
}
