import { z } from 'zod/v4'
import { RGBColorSchema } from './rgb-color.type.js'

export const ItemPresentationSchema = z.object({
	iconPath: z.string(),
	accentColor: RGBColorSchema,
})

export type ItemPresentation = z.infer<typeof ItemPresentationSchema>
