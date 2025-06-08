/**
 * The nature of an interaction effect.
 * - `beneficial`: The effect is helpful to the other item.
 * - `harmful`: The effect is detrimental to the other item.
 * - `neutral`: The effect is neutral.
 */
export type EffectNature = 'beneficial' | 'harmful' | 'neutral'

/**
 * Represents the effect of one item on another in an interaction.
 * These effects are defined in terms of item types (item.id), not specific placements,
 * allowing interactions to be expressed between plant types regardless of their specific instances.
 */
export interface InteractionEffect {
	/** ID of the source item type that causes the effect (e.g., 'plant_tomatoes') */
	sourceItemTypeId: string

	/** ID of the target item type that receives the effect (e.g., 'plant_basil') */
	targetItemTypeId: string

	/** The nature of the effect. */
	nature: EffectNature

	/** A short, one-line description of the effect. */
	description: string
}

/**
 * Models interactions between two adjoining items placed in a garden.
 * This is the raw data representing a relationship. The visual representation
 * is derived from this based on the actual placement of items on the grid.
 *
 * Indicators are not linked to specific zones - they work purely based on
 * item adjacency, regardless of which zone the plants are in.
 */
export interface Indicator {
	/** Unique identifier for this indicator */
	readonly id: string

	/** The effects between items */
	effects: InteractionEffect[]
}

export function isIndicator(item: unknown): item is Indicator {
	const result = !!item && typeof item === 'object' && 'id' in item && 'effects' in item
	console.log('isIndicator', item, result)
	return result
}
