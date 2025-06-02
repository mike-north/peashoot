import { Column, Entity } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'

@Entity({ name: 'garden' })
export class Garden extends PeashootEntity<'grdn'> {
	constructor() {
		super('grdn')
	}

	@Column()
	name!: string
}
