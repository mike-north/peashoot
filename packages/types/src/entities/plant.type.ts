import { z } from 'zod/v4'
import { RGBColorSchema } from '../value-objects/rgb-color.type.js'
import { SeedPacketSchema } from './seed-packet.type.js'
import { DistanceSchema } from '../value-objects/distance.type.js'
import { refOrEmbed } from '../value-objects/ref.js'

export const PlantSchema = z.object({
	name: z.string(),
	variant: z.string(),
	description: z.string(),
	seedPacket: refOrEmbed('spkt', SeedPacketSchema),
	family: z.string(),
	plantingDistance: DistanceSchema,
	accentColor: RGBColorSchema,
	iconPath: z.string(),
})

export type IPlant = z.infer<typeof PlantSchema>
export type IPlantResource = IPlant & { id: `plant_${string}` }
