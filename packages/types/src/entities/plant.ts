import { z } from 'zod/v4'
import { RGBColorSchema } from '../value-objects/rgb-color.type.js'
import { SeedPacketSchema } from './seed-packet.type.js'

export const PlantPresentationSchema = z.object({
	accentColor: RGBColorSchema,
	iconPath: z.string(),
})

export type IPlantPresentation = z.infer<typeof PlantPresentationSchema>

export const PlantSchema = z.object({
	name: z.string(),
	description: z.string(),
	presentation: PlantPresentationSchema,
	seedPacket: SeedPacketSchema
})

export type IPlant = z.infer<typeof PlantSchema>
