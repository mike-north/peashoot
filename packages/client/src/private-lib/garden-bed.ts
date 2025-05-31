import type { GridPlacement } from '../grid/grid-placement'
import type { Plant } from './plant'

// Canonical type for plant grid operations
export type PlantWithSize = Plant

export interface GardenBed {
	id: string
	width: number
	height: number
	waterLevel: number
	sunLevel: number
	plantPlacements: GridPlacement<PlantWithSize>[]
}

export function updatePlantPositionInBed(
	bed: GardenBed,
	plantId: string,
	newX: number,
	newY: number,
): GardenBed {
	return {
		...bed,
		plantPlacements: bed.plantPlacements.map((p: GridPlacement<PlantWithSize>) =>
			p.id === plantId ? { ...p, x: newX, y: newY } : p,
		),
	}
}
