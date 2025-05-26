import { describe, it, expect } from 'vitest'
import {
	timeComparator,
	durationComparator,
	intervalComparator,
	Interval,
} from '../../src/values/time'
import { Duration } from 'date-fns'

describe('timeComparator', () => {
	it('should consider equal times', () => {
		const a = new Date('2024-01-01T00:00:00.000Z')
		const b = new Date('2024-01-01T00:00:00.000Z')
		expect(timeComparator.isEqual(a, b)).toBe(true)
	})

	it('should compare less than and greater than', () => {
		const a = new Date('2024-01-01T00:00:00.000Z')
		const b = new Date('2024-01-01T00:00:01.000Z')
		expect(timeComparator.isLessThan(a, b)).toBe(true)
		expect(timeComparator.isGreaterThan(b, a)).toBe(true)
	})
})

describe('durationComparator', () => {
	it('should consider equal durations', () => {
		const d1: Duration = { hours: 1 }
		const d2: Duration = { minutes: 60 }
		const d3: Duration = { days: 2 }
		const d4: Duration = { hours: 48 }
		const d5: Duration = { hours: 1, minutes: 30 }
		const d6: Duration = { minutes: 90 }
		const d7: Duration = { weeks: 1 }
		const d8: Duration = { days: 7 }
		expect(durationComparator.isEqual(d1, d2)).toBe(true)
		expect(durationComparator.isEqual(d3, d4)).toBe(true)
		expect(durationComparator.isEqual(d5, d6)).toBe(true)
		expect(durationComparator.isEqual(d7, d8)).toBe(true)
	})

	it('should compare less than and greater than', () => {
		const d1: Duration = { hours: 1 }
		const d2: Duration = { hours: 2 }
		const d3: Duration = { minutes: 59 }
		const d4: Duration = { hours: 1, minutes: 29 }
		const d5: Duration = { hours: 1, minutes: 30 }
		const d6: Duration = { hours: 1, minutes: 31 }
		expect(durationComparator.isLessThan(d1, d2)).toBe(true)
		expect(durationComparator.isGreaterThan(d2, d1)).toBe(true)
		expect(durationComparator.isLessThan(d3, d1)).toBe(true)
		expect(durationComparator.isGreaterThan(d1, d3)).toBe(true)
		expect(durationComparator.isLessThan(d4, d5)).toBe(true)
		expect(durationComparator.isGreaterThan(d6, d5)).toBe(true)
	})
})

describe('intervalComparator', () => {
	it('should consider equal intervals', () => {
		const a: Interval = {
			start: new Date('2024-01-01T00:00:00.000Z'),
			end: new Date('2024-01-02T00:00:00.000Z'),
		}
		const b: Interval = {
			start: new Date('2024-01-01T00:00:00.000Z'),
			end: new Date('2024-01-02T00:00:00.000Z'),
		}
		expect(intervalComparator.isEqual(a, b)).toBe(true)
	})

	it('should not consider different intervals as equal', () => {
		const a: Interval = {
			start: new Date('2024-01-01T00:00:00.000Z'),
			end: new Date('2024-01-02T00:00:00.000Z'),
		}
		const b: Interval = {
			start: new Date('2024-01-01T01:00:00.000Z'),
			end: new Date('2024-01-02T00:00:00.000Z'),
		}
		expect(intervalComparator.isEqual(a, b)).toBe(false)
	})
})
