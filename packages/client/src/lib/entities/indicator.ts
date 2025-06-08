/**
 * Represents the position where an indicator appears on the grid
 */
export interface IndicatorPosition {
	/** X coordinate in grid units */
	x: number
	/** Y coordinate in grid units */
	y: number
}

/**
 * The nature of an interaction effect.
 * - `beneficial`: The effect is helpful to the other item.
 * - `harmful`: The effect is detrimental to the other item.
 * - `neutral`: The effect is neutral.
 */
export type EffectNature = 'beneficial' | 'harmful' | 'neutral'

/**
 * Represents the effect of one item on another in an interaction.
 */
export interface InteractionEffect {
	/** ID of the source item in the interaction */
	sourceItemId: string

	/** ID of the target item in the interaction */
	targetItemId: string

	/** The nature of the effect. */
	nature: EffectNature

	/** A short, one-line description of the effect. */
	description: string
}

/**
 * Models interactions between two adjoining items placed in a Zone.
 * This is the raw data representing a relationship. The visual representation
 * is derived from this based on the actual placement of items on the grid.
 */
export interface Indicator {
	/** Unique identifier for this indicator */
	readonly id: string

	/** The zone this indicator belongs to */
	zoneId: string

	effects: InteractionEffect[]
}

export function isIndicator(item: unknown): item is Indicator {
	const result =
		!!item &&
		typeof item === 'object' &&
		'id' in item &&
		'zoneId' in item &&
		'effects' in item
	console.log('isIndicator', item, result)
	return result
}
