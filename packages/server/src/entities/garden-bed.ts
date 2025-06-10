import { Entity, Column, ManyToOne, OneToMany } from 'typeorm'
import { PeashootEntity } from './peashoot-entity'
import { Garden } from './garden'
import { PlantPlacement } from './plant-placement'

@Entity({ name: 'garden-beds' })
export class GardenBed extends PeashootEntity<'gbed'> {
	constructor() {
		super('gbed')
	}

	@Column()
	name!: string

	@Column({ type: 'int' })
	width!: number

	@Column({ type: 'int' })
	height!: number

	@Column()
	description!: string

	@ManyToOne(() => Garden, (garden) => garden.beds, { nullable: false })
	garden!: Garden

	@OneToMany(() => PlantPlacement, (placement) => placement.bed)
	placements!: PlantPlacement[]
}
