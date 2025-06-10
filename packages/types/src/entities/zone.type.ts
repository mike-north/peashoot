import { z } from 'zod/v4'
import {
	createItemPlacementSchemaForItemType,
	ItemPlacementSchema,
} from './item-placement.type.js'

export function createZoneSchemaForItemType<
	IT extends z.ZodObject,
	MD extends z.ZodObject,
>(itemSchema: IT, metadataSchema: MD) {
	return ZoneSchema.extend({
		placements: z.array(createItemPlacementSchemaForItemType(itemSchema)),
		metadata: metadataSchema,
	})
}

export const ZoneSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	width: z.number().int().min(1),
	height: z.number().int().min(1),
	metadata: z.unknown().optional(),
	placements: z.array(ItemPlacementSchema),
})

export type Zone = z.infer<typeof ZoneSchema>
