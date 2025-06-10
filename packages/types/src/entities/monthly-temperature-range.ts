import { z } from 'zod/v4'
import { TemperatureSchema } from '../value-objects/temperature.type.js'
/**
  {
      id: "12eilh12kl",
      locationId: "qwd1klh1dl2"
      month: 4,
      min: { value: 34, unit: "F"},
      max: { value: 44, unit: "F"}
   }
 */

export const MonthlyTemperatureRangeSchema = z.object({
	id: z.string(),
	month: z.int().min(0).max(11),
	min: TemperatureSchema,
	max: TemperatureSchema,
})

export type MonthlyTemperatureRange = z.infer<typeof MonthlyTemperatureRangeSchema>
