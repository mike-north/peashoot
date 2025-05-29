/** A plant placement is a single plant in a square foot bed. It has a position,
a size, and a type. */
export interface PlantPlacement {
	readonly plantId: string
	readonly x: number
	readonly y: number
	readonly id: string
}
