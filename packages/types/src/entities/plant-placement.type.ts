import { z } from 'zod/v4'
import { PlantSchema } from './plant.type.js'
import { XYCoordinateSchema } from '../value-objects/xy-coordinate.type.js'
import { refOrEmbed } from '../value-objects/ref.js'
import { GardenBedSchema } from './garden-bed.type.js'

export const PlantPlacementSchema = z.object({
	plant: refOrEmbed('plant', PlantSchema),
	position: XYCoordinateSchema,
	bed: refOrEmbed('gbed', GardenBedSchema),
})

export type IPlantPlacement = z.infer<typeof PlantPlacementSchema>
