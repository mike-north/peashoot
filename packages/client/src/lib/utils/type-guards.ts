export function isTypedArray<T>(
	array: unknown,
	typeGuard: (item: unknown) => item is T,
): array is T[] {
	return (
		Array.isArray(array) &&
		array.every((item) => typeof item === 'object' && item !== null && typeGuard(item))
	)
}
