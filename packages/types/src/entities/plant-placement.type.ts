import { z } from 'zod/v4'
import { ItemPlacementSchema } from './item-placement.type.js'
import { PlantSchema } from './plant.type.js'

export const PlantPlacementSchema = ItemPlacementSchema.extend({
	item: PlantSchema,
})
export type PlantPlacement = z.infer<typeof PlantPlacementSchema>
