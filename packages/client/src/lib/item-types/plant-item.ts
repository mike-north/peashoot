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
	readonly id: string
	readonly category: string // maps to plant family
	readonly size: number // maps to planting distance
	readonly metadata: PlantMetadata
}

/**
 * Type guard for plant items
 */
export function isPlantItem(item: unknown): item is PlantItem {
	if (!item || typeof item !== 'object') {
		console.debug('PlantItem validation failed: item is not an object')
		return false
	}

	if (!('id' in item)) {
		console.debug('PlantItem validation failed: missing id property')
		return false
	}

	if (typeof item.id !== 'string' || !item.id.startsWith('plant_')) {
		console.debug('PlantItem validation failed: id is not a valid plant id string')
		return false
	}

	if (!('category' in item)) {
		console.debug('PlantItem validation failed: missing category property')
		return false
	}

	if (!('size' in item)) {
		console.debug('PlantItem validation failed: missing size property')
		return false
	}

	if (!('metadata' in item) || !item.metadata) {
		console.debug('PlantItem validation failed: missing metadata property')
		return false
	}

	const metadata = item.metadata
	if (typeof metadata !== 'object') {
		console.debug('PlantItem validation failed: metadata is not an object')
		return false
	}

	if (!('plantingDistanceInFeet' in metadata)) {
		console.debug(
			'PlantItem validation failed: missing plantingDistanceInFeet in metadata',
		)
		return false
	}

	if (!('family' in metadata)) {
		console.debug('PlantItem validation failed: missing family in metadata')
		return false
	}

	return true
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

/**
 * Restore metadata on a plant item that might have lost it during serialization
 */
export function restorePlantItemMetadata(item: unknown): PlantItem | null {
	// Check if it has the basic properties we need
	if (!item || typeof item !== 'object') return null
	if (
		!('id' in item) ||
		!item.id ||
		typeof item.id !== 'string' ||
		!item.id.startsWith('plant_')
	)
		return null
	if (!('category' in item) || !('size' in item)) return null

	// If it already has valid metadata, return as is
	if (
		'metadata' in item &&
		item.metadata &&
		typeof item.metadata === 'object' &&
		'plantingDistanceInFeet' in item.metadata &&
		'family' in item.metadata
	) {
		return item as PlantItem
	}

	// Reconstruct metadata from other properties
	const reconstructed = {
		...item,
		metadata: {
			plantingDistanceInFeet: typeof item.size === 'number' ? item.size : 1,
			family: typeof item.category === 'string' ? item.category : 'unknown',
		},
	}

	console.debug('Restored metadata for plant item', {
		id: reconstructed.id,
		metadata: reconstructed.metadata,
	})

	return reconstructed as PlantItem
}
