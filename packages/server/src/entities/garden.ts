import { Column, Entity, OneToMany } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { GardenBed } from './garden-bed'

@Entity({ name: 'garden' })
export class Garden extends PeashootEntity<'grdn'> {
	constructor() {
		super('grdn')
	}

	@Column()
	name!: string

	@Column()
	description!: string

	@OneToMany(() => GardenBed, (bed) => bed.garden)
	beds!: GardenBed[]
}
