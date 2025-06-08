import { z } from 'zod'

const TemperatureTuple = z
	.tuple([
		z.number().describe('Temperature value'),
		z.enum(['C', 'F']).describe('Temperature unit (Celsius or Fahrenheit)'),
	])
	.describe('Temperature as a [value, unit] tuple')

const TemperatureRange = z
	.object({
		min: TemperatureTuple.describe('Minimum temperature for the period'),
		max: TemperatureTuple.describe('Maximum temperature for the period'),
	})
	.describe('Range of temperatures with min and max values')

const MonthlyTemperature = z
	.object({
		month: z
			.number()
			.min(1, 'Month must be between 1 and 12')
			.max(12, 'Month must be between 1 and 12')
			.describe('Month number (1-12)'),
		temperatureRange: TemperatureRange,
	})
	.describe('Temperature data for a specific month')

const LocationData = z
	.object({
		name: z
			.string()
			.min(1, 'Location name cannot be empty')
			.describe('Name of the location (e.g., city name)'),
		region: z
			.string()
			.min(1, 'Region cannot be empty')
			.describe('Administrative region (e.g., state, province, prefecture)'),
		country: z
			.string()
			.min(1, 'Country cannot be empty')
			.describe('Country where the location is'),
		monthlyTemperatures: z
			.array(MonthlyTemperature)
			.length(12, 'Must provide temperature data for all 12 months')
			.describe('Temperature data for each month of the year'),
	})
	.describe('Location with its monthly temperature data')

export const TemperatureDataSchema = z.object({
	locations: z
		.array(LocationData)
		.min(1, 'Must provide at least one location')
		.describe('List of locations with their temperature data'),
})

export type TemperatureData = z.infer<typeof TemperatureDataSchema>
