import { z } from 'zod/v4'
import { GardenBedSchema } from './garden-bed.type.js'

export const GardenSchema = z.object({
	name: z.string(),
	description: z.string(),
	beds: z.array(GardenBedSchema),
})

export type IGarden = z.infer<typeof GardenSchema>
