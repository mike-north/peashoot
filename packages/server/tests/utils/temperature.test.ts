import { describe, it, expect } from 'vitest'
import { temperatureComparator } from '@peashoot/types'

describe('temperatureComparator', () => {
	it('should consider equal temperatures in same unit', () => {
		expect(
			temperatureComparator.isEqual({ value: 0, unit: 'C' }, { value: 0, unit: 'C' }),
		).toBe(true)
		expect(
			temperatureComparator.isEqual({ value: 32, unit: 'F' }, { value: 32, unit: 'F' }),
		).toBe(true)
	})

	it('should consider equal temperatures in different units', () => {
		expect(
			temperatureComparator.isEqual({ value: 0, unit: 'C' }, { value: 32, unit: 'F' }),
		).toBe(true)
		expect(
			temperatureComparator.isEqual({ value: 100, unit: 'C' }, { value: 212, unit: 'F' }),
		).toBe(true)
	})

	it('should compare less than and greater than correctly', () => {
		expect(
			temperatureComparator.isLessThan({ value: 0, unit: 'C' }, { value: 1, unit: 'C' }),
		).toBe(true)
		expect(
			temperatureComparator.isGreaterThan(
				{ value: 1, unit: 'C' },
				{ value: 0, unit: 'C' },
			),
		).toBe(true)
		expect(
			temperatureComparator.isLessThan(
				{ value: 32, unit: 'F' },
				{ value: 33, unit: 'F' },
			),
		).toBe(true)
		expect(
			temperatureComparator.isGreaterThan(
				{ value: 33, unit: 'F' },
				{ value: 32, unit: 'F' },
			),
		).toBe(true)
		expect(
			temperatureComparator.isLessThan(
				{ value: 0, unit: 'C' },
				{ value: 33.8, unit: 'F' },
			),
		).toBe(true)
		expect(
			temperatureComparator.isGreaterThan(
				{ value: 1, unit: 'C' },
				{ value: 32, unit: 'F' },
			),
		).toBe(true)
	})

	it('should treat temperatures within 0.01C as equal', () => {
		expect(
			temperatureComparator.isEqual({ value: 0, unit: 'C' }, { value: 0.009, unit: 'C' }),
		).toBe(true)
		expect(
			temperatureComparator.isEqual(
				{ value: 32, unit: 'F' },
				{ value: 32.016, unit: 'F' },
			),
		).toBe(true)
	})
})
