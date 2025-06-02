import { z } from 'zod/v4'
import { PlantSchema } from './plant.type.js'
import { XYCoordinateSchema } from '../value-objects/xy-coordinate.type.js'

export const PlantPlacementSchema = z.object({
	plant: PlantSchema,
	position: XYCoordinateSchema,
})

export type IPlantPlacement = z.infer<typeof PlantPlacementSchema>
