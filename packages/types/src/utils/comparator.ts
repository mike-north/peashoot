export interface Comparator<T> {
	isEqual(a: T, b: T): boolean
}

export interface ScalarComparator<T> extends Comparator<T> {
	isLessThan(a: T, b: T): boolean
	isGreaterThan(a: T, b: T): boolean
}
