import { ScalarComparator } from '../utils/comparator'

// Temperature is a tuple: [value, unit], where unit is 'C' or 'F'
type Temperature = [number, 'C' | 'F']

// Helper to convert any temperature to Celsius
function toCelsius([value, unit]: Temperature): number {
	return unit === 'C' ? value : (value - 32) * (5 / 9)
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
