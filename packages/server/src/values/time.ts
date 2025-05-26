import {
	DateArg,
	Interval as DateFnsInterval,
	Duration,
	isAfter,
	isBefore,
	isEqual,
} from 'date-fns'

import { Comparator, ScalarComparator } from '../utils/comparator'

export type Time = DateArg<Date>

const timeComparator: ScalarComparator<Time> = {
	isEqual: (a, b) => isEqual(a, b),
	isLessThan: (a, b) => isBefore(a, b),
	isGreaterThan: (a, b) => isAfter(a, b),
}

export { timeComparator }

function durationToMilliseconds(duration: Duration): number {
	return (
		(duration.years ?? 0) * 365 * 24 * 60 * 60 * 1000 +
		(duration.months ?? 0) * 30 * 24 * 60 * 60 * 1000 + // Approximate month as 30 days
		(duration.weeks ?? 0) * 7 * 24 * 60 * 60 * 1000 +
		(duration.days ?? 0) * 24 * 60 * 60 * 1000 +
		(duration.hours ?? 0) * 60 * 60 * 1000 +
		(duration.minutes ?? 0) * 60 * 1000 +
		(duration.seconds ?? 0) * 1000
	)
}

const durationComparator: ScalarComparator<Duration> = {
	isEqual: (a, b) => durationToMilliseconds(a) === durationToMilliseconds(b),
	isLessThan: (a, b) => durationToMilliseconds(a) < durationToMilliseconds(b),
	isGreaterThan: (a, b) => durationToMilliseconds(a) > durationToMilliseconds(b),
}

export { durationComparator }

export type Interval = DateFnsInterval<Date, Date>

export const intervalComparator: Comparator<Interval> = {
	isEqual: (a, b) => {
		return (
			timeComparator.isEqual(a.start, b.start) && timeComparator.isEqual(a.start, b.start)
		)
	},
}
