import { z } from 'zod/v4'

export const XYPosition = z.object({
	x: z.number(),
	y: z.number(),
})

export type IXYPosition = z.infer<typeof XYPosition>
