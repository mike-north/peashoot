import { z } from 'zod/v4'
import { RGBColorSchema } from '../value-objects/rgb-color.type.js'

export const SeedPacketPresentationSchema = z.object({
	accentColor: RGBColorSchema,
	iconPath: z.string(),
})

export type ISeedPacketPresentation = z.infer<typeof SeedPacketPresentationSchema>

export const SeedPacketSchema = z.object({
	name: z.string(),
	description: z.string(),
	quantity: z.number(),
	plantingInstructions: z.string(),
	presentation: SeedPacketPresentationSchema,
	netWeightGrams: z.number(),
	originLocation: z.string(),
	expiresAt: z.date(),
})

export type ISeedPacket = z.infer<typeof SeedPacketSchema>
