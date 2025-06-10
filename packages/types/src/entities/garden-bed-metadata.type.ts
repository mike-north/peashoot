import { z } from 'zod/v4'

export const GardenBedMetadataSchema = z.object({})

export type GardenBedMetadata = z.infer<typeof GardenBedMetadataSchema>
