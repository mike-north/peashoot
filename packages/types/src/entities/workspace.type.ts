import { z } from 'zod/v4'
import { createZoneSchemaForItemType, ZoneSchema } from './zone.type.js'
import { IndicatorSchema } from './indicator.type.js'

export function createWorkspaceSchemaForItemType<
	IT extends z.ZodObject,
	MDW extends z.ZodObject,
	MDZ extends z.ZodObject,
>(itemSchema: IT, zoneMetadataSchema: MDZ, workspaceMetadataSchema: MDW) {
	return WorkspaceSchema.extend({
		zones: z.array(createZoneSchemaForItemType(itemSchema, zoneMetadataSchema)),
		metadata: workspaceMetadataSchema,
	})
}

export const WorkspaceSchema = z.object({
	id: z.string(),
	metadata: z.unknown().optional(),
	indicators: z.array(IndicatorSchema),
	zones: z.array(ZoneSchema),
})

export type Workspace = z.infer<typeof WorkspaceSchema>