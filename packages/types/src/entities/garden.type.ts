import { z } from 'zod/v4'
import { GardenBedMetadataSchema } from './garden-bed-metadata.type.js'
import { GardenMetadataSchema } from './garden-metadata.type.js'
import { PlantSchema } from './plant.type.js'
import { createWorkspaceSchemaForItemType } from './workspace.type.js'

export const GardenSchema = createWorkspaceSchemaForItemType(
	PlantSchema,
	GardenBedMetadataSchema,
	GardenMetadataSchema,
)

export type Garden = z.infer<typeof GardenSchema>
