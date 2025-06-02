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

	@Column()
	description!: string

	@ManyToOne(() => Garden, (garden) => garden.beds)
	garden!: Garden

	@OneToMany(() => PlantPlacement, (placement) => placement.gardenBed)
	plantPlacements!: PlantPlacement[]
}
