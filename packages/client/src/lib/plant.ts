import type { GridPlaceable } from '../grid/grid-placement'
import type { GridItemPresentation } from '../grid/grid-placement'

export type CompanionPlantingEdgeType = 'prefers-company' | 'prefers-not-company'

export interface Plant extends GridPlaceable {
	readonly id: string
	readonly displayName: string
	readonly family: string
	readonly variant: string
	readonly plantingDistanceInFeet: number
	readonly presentation: GridItemPresentation
}

export function isPlant(item: unknown): item is Plant {
	return (
		typeof item === 'object' &&
		item !== null &&
		'id' in item &&
		'displayName' in item &&
		'family' in item &&
		'variant' in item &&
		'plantingDistanceInFeet' in item &&
		'presentation' in item
	)
}

export function tileSizeForPlant(plant: Plant): number {
	return Math.max(1, Math.ceil(plant.plantingDistanceInFeet))
}

export function assertPlantExists(plant: Plant | undefined): asserts plant is Plant {
	if (!plant) {
		throw new Error('Plant not found for isValidPlacement')
	}
}

export function categoryNameForPlant(plant: Plant): string {
	return plant.family
}
