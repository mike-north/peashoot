import type { Plant } from './plant'
/** A plant placement is a single plant in a square foot bed. It has a position,
a size, and a type. */
export interface PlantPlacement {
	readonly plantTile: Plant
	readonly x: number
	readonly y: number
	readonly id: string
}
