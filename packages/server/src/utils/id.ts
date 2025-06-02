export function isIdWithPrefix<P extends string>(
	prefix: P,
	id: string,
): id is `${P}_${string}` {
	return id.startsWith(prefix + '_')
}
