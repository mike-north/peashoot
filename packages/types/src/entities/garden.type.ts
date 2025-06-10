import { z } from 'zod/v4'
import { PlantSchema } from './plant.type.js'
import { createWorkspaceSchemaForItemType } from './workspace.type.js'

export const GardenSchema = createWorkspaceSchemaForItemType(
	PlantSchema,
	z.object(),
	z.object({}),
)

export type Garden = z.infer<typeof GardenSchema>
