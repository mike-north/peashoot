import { z } from 'zod/v4'

export const GardenMetadataSchema = z.object({})

export type GardenMetadata = z.infer<typeof GardenMetadataSchema>
