/**
 * An express middleware that converts a Zod error to a 400 response.
 */

import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const zodErrorTo400 = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (err instanceof ZodError) {
		res.status(400).json({ error: err.message })
		res.end()
	} else next()
}
