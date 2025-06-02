/**
 * An express middleware that converts a Zod error to a 400 response.
 */

import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { Logger } from 'winston'

export const zodErrorTo400 =
	(logger: Logger) => (err: Error, _req: Request, res: Response, next: NextFunction) => {
		if (err instanceof ZodError) {
			logger.error('Zod validation error:', {
				message: err.message,
				issues: err.issues,
			})
			res.status(400).json({
				message: 'Validation error',
				errors: err.issues,
			})
			// Do not call next(err) as we have handled the error and sent a response.
		} else {
			// Pass other errors to the next error handler in the chain.
			next(err)
		}
	}
