import type { Workspace } from '../lib/entities/workspace'

/**
 * Calculate column spans for zones in the workspace view
 */
export function calculateZoneViewColSpans(workspace: Workspace): Record<string, number> {
	const colSpans: Record<string, number> = {}
	
	// For now, use a simple algorithm that gives larger zones more column span
	for (const zone of workspace.zones) {
		const area = zone.width * zone.height
		if (area >= 20) {
			colSpans[zone.id] = 2
		} else if (area >= 10) {
			colSpans[zone.id] = 1
		} else {
			colSpans[zone.id] = 1
		}
	}
	
	return colSpans
} 