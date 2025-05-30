import type { DraggableItemPresentation } from './dnd/types'

export interface Plant {
	readonly id: string
	readonly size: number
	readonly displayName: string
	readonly family: string
	readonly variant: string
	readonly presentation: DraggableItemPresentation
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

export function assertPlantExists(plant: Plant | undefined): asserts plant is Plant {
	if (!plant) {
		throw new Error('Plant not found for isValidPlacement')
	}
}
