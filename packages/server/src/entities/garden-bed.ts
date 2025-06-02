import { Entity, Column, ManyToOne, OneToMany } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { IGardenBed } from '@peashoot/types'
import { Garden } from './garden'
import { PlantPlacement } from './plant-placement'

@Entity({ name: 'garden-beds' })
export class GardenBed extends PeashootEntity<'gbed'> implements IGardenBed {
	constructor() {
		super('gbed')
	}

	@Column()
	name!: string

	@Column({ type: 'int' })
	rows!: number

	@Column({ type: 'int' })
	columns!: number

	@Column()
	description!: string

	@ManyToOne(() => Garden, (garden) => garden.beds, { nullable: false })
	garden!: Garden

	@OneToMany(() => PlantPlacement, (placement) => placement.bed)
	plantPlacements!: PlantPlacement[]
}
