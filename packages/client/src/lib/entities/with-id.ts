/**
 * Represents an item that can be dragged from place to place
 */
export interface WithId {
	id: string
}

export function isWithId(item: unknown): item is WithId {
	if (typeof item !== 'object' || item === null) return false
	const obj = item as Record<string, unknown>
	return 'id' in obj && typeof obj.id === 'string'
}
