export class InvalidArgsError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidArgsError'
	}
}
