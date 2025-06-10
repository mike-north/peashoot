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

export function isDistanceUnit(value: string): value is IDistanceUnit {
	return ['inches', 'feet', 'yards', 'meters', 'centimeters'].includes(value)
}

export function stringToDistanceUnit(value: string): IDistanceUnit {
	if (isDistanceUnit(value)) {
		return value
	}
	throw new Error(`Invalid distance unit: ${value}`)
}

export function convertDistanceToFeet(distance: IDistance): IDistance {
	switch (distance.unit) {
		case 'inches':
			return {
				value: distance.value / 12,
				unit: 'feet',
			}
		case 'feet':
			return distance
		case 'yards':
			return {
				value: distance.value * 3,
				unit: 'feet',
			}
		case 'meters':
			return {
				value: distance.value * 3.28084,
				unit: 'feet',
			}
		case 'centimeters':
			return {
				value: distance.value * 0.0328084,
				unit: 'feet',
			}
		default: {
			const nvr: never = distance.unit
			throw new Error(`Invalid distance unit: ${nvr as string}`)
		}
	}
}
