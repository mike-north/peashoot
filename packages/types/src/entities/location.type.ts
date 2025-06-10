import { z } from 'zod/v4'
import { LocationMonthlyTemperatureSchema } from './location-monthly-temperature.type.js'

export const LocationSchema = z.object({
	id: z.string(),
	name: z.string(),
	region: z.string(),
	country: z.string(),
	monthlyTemperatures: z.array(LocationMonthlyTemperatureSchema),
})

export type Location = z.infer<typeof LocationSchema>
