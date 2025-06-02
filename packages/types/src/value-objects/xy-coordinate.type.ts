import { z } from 'zod/v4'

export const XYCoordinateSchema = z.object({
	x: z.number(),
	y: z.number(),
})

export type IXYCoordinate = z.infer<typeof XYCoordinateSchema>
