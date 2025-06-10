import { z } from 'zod/v4'
import { ItemPresentationSchema } from '../value-objects/item-presentation.type.js'

export const ItemSchema = z.object({
	id: z.string(),
	category: z.string(),
	variant: z.string(),
	displayName: z.string(),
	size: z.int(),
	presentation: ItemPresentationSchema,
	metadata: z.unknown().optional(),
})

export function isItem(item: unknown): item is Item {
	return ItemSchema.safeParse(item).success
}

export function createItemTypeWithMetadataSchema<MS extends z.ZodType>(
	metadataSchema: MS,
) {
	return ItemSchema.extend({
		metadata: metadataSchema,
	})
}

export type Item = z.infer<typeof ItemSchema>
