import type { GridPlacement } from './grid-placement'
import type { Plant } from './plant'

/** A plant placement is a single plant in a square foot bed. It has a position,
a size, and a type. */
export interface PlantPlacement {
	readonly plantId: string
	readonly x: number
	readonly y: number
	readonly id: string
}

/**
 * Converts a legacy PlantPlacement to a GridPlacement<Plant>
 */
export function plantPlacementToGridPlacement(
	placement: PlantPlacement,
	plant: Plant,
): GridPlacement<Plant> {
	return {
		id: placement.id,
		x: placement.x,
		y: placement.y,
		size: plant.plantingDistanceInFeet,
		data: plant,
	}
}
