// Custom Error for Async Validation Failures
export class AsyncValidationError extends Error {
	originalError: unknown
	constructor(message: string, originalError?: unknown) {
		super(message)
		this.name = 'AsyncValidationError'
		this.originalError = originalError
		Object.setPrototypeOf(this, AsyncValidationError.prototype)
	}
}
