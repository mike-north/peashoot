import { z } from 'zod/v4'
import { DistanceSchema } from '../value-objects/distance.type.js'

export const SeedPacketMetadataSchema = z.object({
	quantity: z.number(),
	plantingInstructions: z.string(),
	plantingDistance: DistanceSchema,
	netWeightGrams: z.number(),
	originLocation: z.string(),
})

export type SeedPacketMetadata = z.infer<typeof SeedPacketMetadataSchema>
