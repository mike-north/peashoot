import { z } from 'zod/v4'
import { TemperatureRangeSchema } from '../value-objects/temperature-range.type.js'

export const LocationMonthlyTemperatureSchema = z.object({
	id: z.string(),
	month: z.int(),
	temperatureRange: TemperatureRangeSchema,
})

export type LocationMonthlyTemperature = z.infer<typeof LocationMonthlyTemperatureSchema>
