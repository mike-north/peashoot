import { z } from 'zod/v4'

export const TemperatureSchema = z.object({
	value: z.number(),
	unit: z.union([z.literal('C'), z.literal('F')]),
})

export type Temperature = z.infer<typeof TemperatureSchema>
