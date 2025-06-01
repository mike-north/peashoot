/**
 * An express middleware that converts a Zod error to a 400 response.
 */

import { Request, Response } from 'express'
import { ZodError } from 'zod'

export const zodErrorTo400 = (err: Error, req: Request, res: Response) => {
	if (err instanceof ZodError) {
		return res.status(400).json({ error: err.message })
	}
}
