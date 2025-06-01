import { Entity, Column, OneToMany } from 'typeorm'
import { PlantableArea } from './plantable-area'
import { PeashootEntity } from './peashoot-entity'

@Entity({ name: 'garden-beds' })
export class GardenBed extends PeashootEntity<'gbed'> {
	get id() {
		return `gbed_${this._id}` as const
	}

	@Column()
	name!: string

	@OneToMany(() => PlantableArea, (plantableArea) => plantableArea.gardenBed)
	plantableAreas!: PlantableArea[]
}
