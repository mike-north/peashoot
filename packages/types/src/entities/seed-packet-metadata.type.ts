import { z } from 'zod/v4'

export const SeedPacketMetadataSchema = z.object({
	quantity: z.number(),
})

export type SeedPacketMetadata = z.infer<typeof SeedPacketMetadataSchema>
