/**
 * Plant-specific metadata interface
 */
export interface PlantMetadata extends Record<string, unknown> {
	plantingDistanceInFeet: number
	family: string
}

export function isPlantMetadata(metadata: unknown): metadata is PlantMetadata {
	return (
		!!metadata &&
		typeof metadata === 'object' &&
		'plantingDistanceInFeet' in metadata &&
		'family' in metadata
	)
}
