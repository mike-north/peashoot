import { z } from 'zod/v4'

export const GardenBedSchema = z.object({
	name: z.string(),
	description: z.string(),
})

export type IGardenBed = z.infer<typeof GardenBedSchema>
