import { z } from 'zod/v4'
import { DistanceSchema } from '../value-objects/distance.type.js'

export const PlantMetadataSchema = z.object({
	plantingDistance: DistanceSchema,
})

export function isPlantMetadata(metadata: unknown): metadata is PlantMetadata {
	return PlantMetadataSchema.safeParse(metadata).success
}

export type PlantMetadata = z.infer<typeof PlantMetadataSchema>
