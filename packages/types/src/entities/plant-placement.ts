import { z } from 'zod/v4'
import { PlantSchema } from './plant.js'
import { XYPosition } from '../value-objects/xy-coordinate.js'

export const PlantPlacementSchema = z.object({
	name: z.string(),
	description: z.string(),
	plant: PlantSchema,
	position: XYPosition,
})
export type IPlantPlacement = z.infer<typeof PlantPlacementSchema>
