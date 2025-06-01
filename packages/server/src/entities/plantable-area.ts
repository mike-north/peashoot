import { Entity, ManyToOne, OneToMany, Column } from 'typeorm'
import { GardenBed } from './garden-bed'
import { Plant } from './plant'
import { PeashootEntity } from './peashoot-entity'

@Entity({ name: 'plantable-areas' })
export class PlantableArea extends PeashootEntity<'plarea'> {
	get id() {
		return `plarea_${this._id}` as const
	}

	@OneToMany(() => Plant, (plant) => plant.plantableArea)
	plants!: Plant[]

	@ManyToOne(() => GardenBed, (gardenBed) => gardenBed.plantableAreas)
	gardenBed!: GardenBed

	@Column({ type: 'int', nullable: false })
	width!: number

	@Column({ type: 'int', nullable: false })
	height!: number

	get area(): number {
		return this.width * this.height
	}
}
