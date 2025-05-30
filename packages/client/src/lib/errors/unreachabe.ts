export class UnreachableError extends Error {
	constructor(_value: never, message: string) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		super(`(${_value})${message}`)
		this.name = 'UnreachableError'
	}
}
