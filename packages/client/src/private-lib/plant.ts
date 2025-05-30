export type CompanionPlantingEdgeType = 'prefers-company' | 'prefers-not-company'

export interface TileVisualPresentation {
	readonly accentColor: {
		r: number
		g: number
		b: number
		a?: number
	}
	readonly size: number
	readonly iconPath: string
}

export interface Plant {
	readonly id: string
	readonly displayName: string
	readonly family: string
	readonly variant: string
	readonly plantingDistanceInFeet: number
	readonly presentation: TileVisualPresentation
}

/**
 * Adapter to make TileVisualPresentation compatible with GridItemPresentation
 */
export function tileVisualPresentationToGridPresentation(
	presentation: TileVisualPresentation,
) {
	return {
		iconPath: `plant-icons/${presentation.iconPath}`,
		accentColor: presentation.accentColor,
	}
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
