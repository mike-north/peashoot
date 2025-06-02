import { z } from 'zod/v4'

export const GardenSchema = z.object({
	name: z.string(),
	description: z.string(),
})

export type IGarden = z.infer<typeof GardenSchema>
