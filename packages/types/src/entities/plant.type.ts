import { z } from 'zod/v4'
import { createItemTypeWithMetadataSchema } from './item.type.js'
import { PlantMetadataSchema } from './plant-metadata.type.js'

export const PlantSchema = createItemTypeWithMetadataSchema(PlantMetadataSchema)
export type Plant = z.infer<typeof PlantSchema>
