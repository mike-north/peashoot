export interface PlantVisualPresentation {
	readonly accentColor: string
	readonly tileIconPath: string
}

export interface Plant {
	readonly id: string
	readonly displayName: string
	readonly family: string
	readonly variant: string
	readonly plantingDistanceInFeet: number
	readonly presentation: PlantVisualPresentation
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
