import type { GridArea } from '../../private/grid/grid-area'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { Plant } from './plant'

// Canonical type for plant grid operations
export type PlantWithSize = Plant

export interface GardenBed extends GridArea<PlantWithSize> {
	id: string
	width: number
	height: number
	waterLevel: number
	sunLevel: number
}

export function updatePlantPositionInBed(
	bed: GardenBed,
	plantId: string,
	newX: number,
	newY: number,
): GardenBed {
	return {
		...bed,
		placements: bed.placements.map((p: GridPlacement<PlantWithSize>) =>
			p.id === plantId ? { ...p, x: newX, y: newY } : p,
		),
	}
}
