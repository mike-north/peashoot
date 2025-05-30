export function assertNonEmpty<T>(value: T | '' | null | undefined): asserts value is T {
	if (value === '' || value === null || value === undefined) {
		throw new Error('Value is empty')
	}
}
