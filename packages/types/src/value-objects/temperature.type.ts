import { z } from 'zod/v4'
import { ScalarComparator } from '../utils/comparator.js'

export const TemperatureSchema = z.object({
	value: z.number(),
	unit: z.union([z.literal('C'), z.literal('F')]),
})

export type Temperature = z.infer<typeof TemperatureSchema>

// Helper to convert any temperature to Celsius
export function toCelsius(temp: Temperature | [number, 'C' | 'F']): number {
	if (Array.isArray(temp)) {
		const [value, unit] = temp
		return unit === 'C' ? value : (value - 32) * (5 / 9)
	}
	return temp.unit === 'C' ? temp.value : (temp.value - 32) * (5 / 9)
}

export const temperatureComparator: ScalarComparator<Temperature> = {
	isEqual: (a: Temperature, b: Temperature) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return Math.abs(aC - bC) < 0.01
	},
	isLessThan: (a: Temperature, b: Temperature) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return aC < bC
	},
	isGreaterThan: (a: Temperature, b: Temperature) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return aC > bC
	},
}
