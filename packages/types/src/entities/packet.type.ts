import { z } from 'zod/v4'
import { ItemPresentationSchema } from '../value-objects/item-presentation.type.js'

export const PacketSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: z.string(),
	presentation: ItemPresentationSchema,
	expiresAt: z.string(),
})

export function createPacketTypeWithMetadataSchema<MS extends z.ZodType>(
	metadataSchema: MS,
) {
	return PacketSchema.extend({
		metadata: metadataSchema,
	})
}

export type Packet = z.infer<typeof PacketSchema>
