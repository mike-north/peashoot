import { Column, Entity } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'

@Entity({ name: 'garden' })
export class Garden extends PeashootEntity<'grdn'> {
	get id() {
		return `grdn_${this._id}` as const
	}

	@Column()
	name!: string
}
