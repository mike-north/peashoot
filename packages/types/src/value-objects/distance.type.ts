import { z } from 'zod/v4'

export const DistanceUnitSchema = z.union([
	z.literal('inches'),
	z.literal('feet'),
	z.literal('yards'),
	z.literal('meters'),
	z.literal('centimeters'),
])

export type IDistanceUnit = z.infer<typeof DistanceUnitSchema>

export const DistanceSchema = z.object({
	value: z.number(),
	unit: DistanceUnitSchema,
})

export type IDistance = z.infer<typeof DistanceSchema>

export function distanceToHumanReadable(distance: IDistance): string {
	return `${distance.value}${distance.unit}`
}
