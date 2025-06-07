import { Router, Request, Response, NextFunction } from 'express'
import { InvalidArgsError } from './errors/invalid-args-error'
import { PlantsService } from '../services/plants-service'
import { asyncHandler } from './middlewares/async-handler'
import { Logger } from 'winston'

export function createPlantRouter(logger: Logger): Router {
	const plantsService = new PlantsService()
	const router = Router()

	router.get(
		'/',
		asyncHandler(
			async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
				try {
					const plants = await plantsService.getAllPlants()
					res.json(plants)
				} catch (error) {
					logger.error('Error in GET /plants:', error)
					if (error instanceof InvalidArgsError) {
						res.status(400).json({ error: error.message })
					} else {
						res.status(500).json({ error: 'Internal server error' })
					}
				}
			},
		),
	)

	return router
}
