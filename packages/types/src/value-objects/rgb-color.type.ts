import { z } from 'zod/v4'

export const RGBColorSchema = z.object({
	red: z.number(),
	green: z.number(),
	blue: z.number(),
	alpha: z.number().optional(),
})

export type IRGBColor = z.infer<typeof RGBColorSchema>

export function rgbToCss(rgb: IRGBColor): string {
	return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`
}
