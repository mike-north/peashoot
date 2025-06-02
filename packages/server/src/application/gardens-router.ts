import { Router } from 'express'
import { GardensService } from '../services/gardens-service'
import { InvalidArgsError } from './errors/invalid-args-error'
import { asyncHandler } from './middlewares/async-handler'

export function createGardenRouter(): Router {
	const gardensService = new GardensService()
	const router = Router()

	router.get(
		'/',
		asyncHandler(async (_req, res, _next) => {
			try {
				const gardens = await gardensService.getAllGardens()
				res.json(gardens)
			} catch (error) {
				if (error instanceof InvalidArgsError) {
					res.status(400).json({ error: error.message })
					return
				}
				res.status(500).json({ error: 'Internal server error' })
			}
		}),
	)
	return router
}
