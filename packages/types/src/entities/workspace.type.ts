import { z } from 'zod/v4'
import { createZoneSchemaForItemType, Zone, ZoneSchema } from './zone.type.js'
import { IndicatorSchema } from './indicator.type.js'
import { ItemPlacement } from './item-placement.type.js'

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
	metadata: z.unknown(),
	indicators: z.array(IndicatorSchema),
	zones: z.array(ZoneSchema),
})

export type Workspace = z.infer<typeof WorkspaceSchema>

export function moveItemBetweenZonesAndCreateNewWorkspace(
	workspace: Workspace,
	sourceZoneId: string,
	targetZoneId: string,
	placement: ItemPlacement,
	newX: number,
	newY: number,
): Workspace {
	const sourceZone = workspace.zones.find((z: Zone) => z.id === sourceZoneId)
	const targetZone = workspace.zones.find((z: Zone) => z.id === targetZoneId)

	if (!sourceZone || !targetZone) {
		console.error(
			'[workspace.ts] Source or target zone not found for moveItemBetweenZones.',
		)
		return workspace // Return original workspace if zones not found
	}

	const updatedSourceZone = {
		...sourceZone,
		placements: sourceZone.placements.filter((p) => p.id !== placement.id),
	}

	const updatedTargetZone: Zone = {
		...targetZone,
		placements: [
			...targetZone.placements,
			{
				...placement,
				position: {
					x: newX,
					y: newY,
				},
				sourceZoneId: targetZoneId,
				item: placement.item,
			},
		],
	}

	return {
		...workspace,
		zones: workspace.zones.map((z: Zone) => {
			if (z.id === sourceZoneId) return updatedSourceZone
			if (z.id === targetZoneId) return updatedTargetZone
			return z
		}),
	}
}

export function findZone(workspace: Workspace, zoneId: string): Zone | undefined {
	return workspace.zones.find((zone) => zone.id === zoneId)
}
