import { z } from 'zod/v4'
import { GardenBedSchema } from './garden-bed.js'

export const GardenSchema = z.object({
	name: z.string(),
	description: z.string(),
	beds: z.array(GardenBedSchema),
})

export type IPlant = z.infer<typeof GardenSchema>
