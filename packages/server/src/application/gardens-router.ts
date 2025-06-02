import { Router } from 'express'
import { GardensService } from '../services/gardens-service'
import { asyncHandler } from './middlewares/async-handler'
import { Logger } from 'winston'

export function createGardenRouter(_logger: Logger): Router {
	const gardensService = new GardensService()
	const router = Router()

	router.get(
		'/',
		asyncHandler(async (_req, res, _next) => {
			res.json(await gardensService.getAllGardens())
		}),
	)
	return router
}
