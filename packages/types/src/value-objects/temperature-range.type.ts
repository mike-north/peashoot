import { z } from 'zod/v4'

export const TemperatureRangeSchema = z.object({
	min: z.number().min(-100).max(200),
	max: z.number().min(-100).max(200),
})

export type TemperatureRange = z.infer<typeof TemperatureRangeSchema>
