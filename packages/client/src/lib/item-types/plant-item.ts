import type { Item } from '../entities/item'

/**
 * Plant-specific metadata interface
 */
export interface PlantMetadata extends Record<string, unknown> {
	plantingDistanceInFeet: number
	family: string
}

/**
 * Plant item type - extends the generic Item with plant-specific semantics
 */
export interface PlantItem extends Item {
	readonly id: `plant_${string}`
	readonly category: string // maps to plant family
	readonly size: number // maps to planting distance
	readonly metadata: PlantMetadata
}

/**
 * Type guard for plant items
 */
export function isPlantItem(item: unknown): item is PlantItem {
	return (
		typeof item === 'object' &&
		item !== null &&
		'id' in item &&
		typeof item.id === 'string' &&
		item.id.startsWith('plant_') &&
		'category' in item &&
		'size' in item &&
		'metadata' in item &&
		typeof item.metadata === 'object' &&
		item.metadata !== null &&
		'plantingDistanceInFeet' in item.metadata &&
		'family' in item.metadata
	)
}

/**
 * Create a PlantItem from legacy plant data
 */
export function createPlantItem(plantData: {
	id: string
	displayName: string
	family: string
	variant: string
	plantingDistanceInFeet: number
	presentation: Item['presentation']
}): PlantItem {
	return {
		id: plantData.id as `plant_${string}`,
		displayName: plantData.displayName,
		category: plantData.family,
		variant: plantData.variant,
		size: plantData.plantingDistanceInFeet,
		presentation: plantData.presentation,
		metadata: {
			plantingDistanceInFeet: plantData.plantingDistanceInFeet,
			family: plantData.family,
		},
	}
}

/**
 * Get plant-specific properties from a PlantItem
 */
export function getPlantProperties(item: PlantItem): {
	plantingDistanceInFeet: number
	family: string
} {
	return {
		plantingDistanceInFeet: item.metadata.plantingDistanceInFeet,
		family: item.metadata.family,
	}
}
