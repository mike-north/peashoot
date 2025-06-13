import { Router, Request, Response, NextFunction } from 'express'
import { InvalidArgsError } from './errors/invalid-args-error.js'
import { PlantsService } from '../services/plants-service.js'
import { asyncHandler } from './middlewares/async-handler.js'
import { Logger } from 'winston'
import { convertDistanceToFeet } from '@peashoot/types'

export function createPlantRouter(logger: Logger): Router {
	const plantsService = new PlantsService()
	const router = Router()

	router.get(
		'/',
		asyncHandler(
			async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
				try {
					const plants = await plantsService.getAllPlants()

					const response = plants.map((plant) => ({
						id: plant.id,
						category: plant.family,
						variant: plant.variant,
						displayName: plant.name,
						size: Math.max(
							1,
							Math.ceil(convertDistanceToFeet(plant.plantingDistance).value),
						),
						presentation: {
							iconPath: plant.presentation.iconPath,
							accentColor: plant.presentation.accentColor,
						},
						metadata: {
							plantingDistance: plant.plantingDistance,
						},
					}))
					res.json(response)
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
