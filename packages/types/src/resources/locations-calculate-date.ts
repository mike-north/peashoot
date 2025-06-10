import { z } from 'zod/v4'
import { TemperatureSchema } from '../value-objects/temperature.type.js'

export const CalculateDateRequestSchema = z.object({
	locationId: z.string(),
	temperature: TemperatureSchema,
})

export type CalculateDateRequest = z.infer<typeof CalculateDateRequestSchema>

export const CalculateDateResponseSchema = z.object({
	date: z.string(),
})

export type CalculateDateResponse = z.infer<typeof CalculateDateResponseSchema>
