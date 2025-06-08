import { describe, expect, it } from 'vitest'
import { TemperatureDataSchema } from '../../src/data/temperature-data.schema'

describe('TemperatureDataSchema', () => {
	it('should validate correct temperature data', () => {
		const validData = {
			locations: [
				{
					name: 'Tokyo',
					region: 'Tokyo',
					country: 'Japan',
					monthlyTemperatures: Array.from({ length: 12 }, (_, i) => ({
						month: i + 1,
						temperatureRange: {
							min: [8.3, 'C'],
							max: [13.9, 'C'],
						},
					})),
				},
			],
		}

		const result = TemperatureDataSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	it('should reject invalid temperature unit with descriptive error', () => {
		const invalidData = {
			locations: [
				{
					name: 'Sydney',
					region: 'New South Wales',
					country: 'Australia',
					monthlyTemperatures: Array.from({ length: 12 }, (_, i) => ({
						month: i + 1,
						temperatureRange: {
							min: [8.3, 'K'], // Invalid unit
							max: [13.9, 'C'],
						},
					})),
				},
			],
		}

		const result = TemperatureDataSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.errors[0].message).toContain('Invalid enum value')
		}
	})

	it('should reject invalid month number with descriptive error', () => {
		const invalidData = {
			locations: [
				{
					name: 'Berlin',
					region: 'Berlin',
					country: 'Germany',
					monthlyTemperatures: Array.from({ length: 12 }, (_, i) => ({
						month: i === 0 ? 13 : i + 1, // Invalid month for first entry
						temperatureRange: {
							min: [8.3, 'C'],
							max: [13.9, 'C'],
						},
					})),
				},
			],
		}

		const result = TemperatureDataSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.errors[0].message).toBe('Month must be between 1 and 12')
		}
	})

	it('should reject missing monthly temperatures with descriptive error', () => {
		const invalidData = {
			locations: [
				{
					name: 'Cairo',
					region: 'Cairo',
					country: 'Egypt',
					monthlyTemperatures: [], // Missing temperatures
				},
			],
		}

		const result = TemperatureDataSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.errors[0].message).toBe(
				'Must provide temperature data for all 12 months',
			)
		}
	})

	it('should reject empty location name with descriptive error', () => {
		const invalidData = {
			locations: [
				{
					name: '', // Empty name
					region: 'Ontario',
					country: 'Canada',
					monthlyTemperatures: Array.from({ length: 12 }, (_, i) => ({
						month: i + 1,
						temperatureRange: {
							min: [8.3, 'C'],
							max: [13.9, 'C'],
						},
					})),
				},
			],
		}

		const result = TemperatureDataSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.errors[0].message).toBe('Location name cannot be empty')
		}
	})

	it('should reject empty locations array with descriptive error', () => {
		const invalidData = {
			locations: [],
		}

		const result = TemperatureDataSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.errors[0].message).toBe('Must provide at least one location')
		}
	})
})
