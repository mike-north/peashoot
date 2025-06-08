/**
 * Plant-specific metadata interface
 */
export interface PlantMetadata {
	/** A decimal number that represents the planting distance in feet */
	plantingDistanceInFeet: number
}

export function isPlantMetadata(metadata: unknown): metadata is PlantMetadata {
	return (
		!!metadata && typeof metadata === 'object' && 'plantingDistanceInFeet' in metadata
	)
}
