import type { PlantPlacement } from './plant-placement'

export interface GardenBed {
	id: string
	width: number
	height: number
	waterLevel: number
	sunLevel: number
	plantPlacements: PlantPlacement[]
}

export function updatePlantPositionInBed(
	bed: GardenBed,
	plantId: string,
	newX: number,
	newY: number,
): GardenBed {
	return {
		...bed,
		plantPlacements: bed.plantPlacements.map((p: PlantPlacement) =>
			p.id === plantId ? { ...p, x: newX, y: newY } : p,
		),
	}
}
