import { ScalarComparator } from '../utils/comparator'
import { z } from 'zod'

export const temperatureSchema = z.object({
	value: z.number(),
	unit: z.union([z.literal('C'), z.literal('F')]),
})

// Temperature is a tuple: [value, unit], where unit is 'C' or 'F'
type Temperature = z.infer<typeof temperatureSchema>

// Helper to convert any temperature to Celsius
export function toCelsius(temp: Temperature | [number, 'C' | 'F']): number {
	if (Array.isArray(temp)) {
		const [value, unit] = temp
		return unit === 'C' ? value : (value - 32) * (5 / 9)
	}
	return temp.unit === 'C' ? temp.value : (temp.value - 32) * (5 / 9)
}

const temperatureComparator: ScalarComparator<Temperature> = {
	isEqual: (a, b) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return Math.abs(aC - bC) < 0.01
	},
	isLessThan: (a, b) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return aC < bC
	},
	isGreaterThan: (a, b) => {
		const aC = toCelsius(a)
		const bC = toCelsius(b)
		return aC > bC
	},
}

export default Temperature
export { temperatureComparator }
