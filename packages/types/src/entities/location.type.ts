import { z } from 'zod/v4'

export const LocationSchema = z.object({
	id: z.string(),
	name: z.string(),
	region: z.string(),
	country: z.string(),
})

export type Location = z.infer<typeof LocationSchema>
