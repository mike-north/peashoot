import { z } from 'zod/v4'
import { SeedPacketMetadataSchema } from './seed-packet-metadata.type.js'
import { createPacketTypeWithMetadataSchema } from './packet.type.js'

export const SeedPacketSchema = createPacketTypeWithMetadataSchema(
	SeedPacketMetadataSchema,
)

export type SeedPacket = z.infer<typeof SeedPacketSchema>
