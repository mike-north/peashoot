import { z } from 'zod/v4'

export const SeedPacketMetadataSchema = z.object({
	quantity: z.int().min(0),
	plantingDistance: z.number().min(0),
	daysToHarvest: z.int().min(0),
	expiresAt: z.string(),
})

export type SeedPacketMetadata = z.infer<typeof SeedPacketMetadataSchema>
