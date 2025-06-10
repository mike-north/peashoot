import { z } from 'zod/v4'
import { TemperatureSchema } from './temperature.type.js'

export const TemperatureRangeSchema = z.object({
	min: TemperatureSchema,
	max: TemperatureSchema,
})

export type TemperatureRange = z.infer<typeof TemperatureRangeSchema>
