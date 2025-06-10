import { z } from 'zod/v4'

export const PlantPlacementMetadataSchema = z.object({})

export type PlantPlacementMetadata = z.infer<typeof PlantPlacementMetadataSchema>
