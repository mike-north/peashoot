import { z } from 'zod/v4'

export const CalculateDateRequestSchema = z.object({
	locationId: z.string(),
	temperature: z.object({
		value: z.number(),
		unit: z.union([z.literal('C'), z.literal('F')]),
	}),
})

export type CalculateDateRequest = z.infer<typeof CalculateDateRequestSchema>

export const CalculateDateResponseSchema = z.object({
	date: z.string(),
})

export type CalculateDateResponse = z.infer<typeof CalculateDateResponseSchema>
