import { v4 as uuid } from 'uuid'

export function makeUniqueId(prefix: string): string {
	return `${prefix}_${uuid()}`
}
