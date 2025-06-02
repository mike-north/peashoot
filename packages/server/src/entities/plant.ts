import { Entity, Column, ManyToOne } from 'typeorm'
import { PlantableArea } from './plantable-area'
import { SeedPacket } from './seed-packet'
import { PeashootEntity } from './peashoot-entity'
import { z } from 'zod/v4'

export const PlantSchema = z.object({
	name: z.string(),
	family: z.string(),
	description: z.string(),
	variant: z.string(),
	plantingDistance: z.number(),
})
export type IPlant = z.infer<typeof PlantSchema>

@Entity({ name: 'plants' })
export class Plant extends PeashootEntity<'plant'> implements IPlant {
	constructor() {
		super('plant')
	}

	@ManyToOne(() => SeedPacket, (seedPacket) => seedPacket.plants)
	seedPacket?: SeedPacket

	@ManyToOne(() => PlantableArea, (plantableArea) => plantableArea.plants)
	plantableArea?: PlantableArea

	@Column({ nullable: false }) name!: string
	@Column({ nullable: false }) family!: string
	@Column({ nullable: false }) description!: string
	@Column({ nullable: false }) variant!: string
	@Column({ nullable: false }) plantingDistance!: number
}
