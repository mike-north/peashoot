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

	/** ID of the first item in the interaction */
	itemAId: string

	/** ID of the second item in the interaction */
	itemBId: string

	/** The effect of item A on item B. If undefined, there is no visual effect. */
	effectAonB?: InteractionEffect

	/** The effect of item B on item A. If undefined, there is no visual effect. */
	effectBonA?: InteractionEffect

	/** Optional tooltip text that appears on hover */
	tooltip?: string

	/** Optional metadata about the interaction type */
	interactionType?: string
}
