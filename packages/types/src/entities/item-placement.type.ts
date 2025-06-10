import { z } from 'zod/v4'
import { ItemSchema } from './item.type.js'
import { XYCoordinateSchema } from '../value-objects/xy-coordinate.type.js'

export function createItemPlacementSchemaForItemType<IT extends z.ZodObject>(
	itemSchema: IT,
) {
	return ItemPlacementSchema.extend({ item: itemSchema })
}

export const ItemPlacementSchema = z.object({
	id: z.string(),
	position: XYCoordinateSchema,
	item: ItemSchema,
	sourceZoneId: z.string(),
})

export function isItemPlacement(item: unknown): item is ItemPlacement {
	return ItemPlacementSchema.safeParse(item).success
}

export type ItemPlacement = z.infer<typeof ItemPlacementSchema>
