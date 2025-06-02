import { z } from 'zod/v4'
import { GardenSchema } from './garden.type.js'
import { refOrEmbed } from '../value-objects/ref.js'

export const GardenBedSchema = z.object({
	name: z.string(),
	description: z.string(),
	rows: z.number().int().min(1),
	columns: z.number().int().min(1),
	garden: refOrEmbed('grdn', GardenSchema),
})

export type IGardenBed = z.infer<typeof GardenBedSchema>
