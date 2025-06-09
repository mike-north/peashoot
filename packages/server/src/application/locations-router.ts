import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { asyncHandler } from './middlewares/async-handler'
import { LocationService } from '../services/location'
import { Logger } from 'winston'

const calculateDateSchema = z.object({
	temperature: z.object({
		value: z.number(),
		unit: z.enum(['C', 'F']),
	}),
})

export function createLocationRouter(logger: Logger): Router {
	const router = Router()
	const locationService = new LocationService()

	router.get(
		'/',
		asyncHandler(async (_req: Request, res: Response) => {
			const locations = await locationService.getAllLocations()
			res.json(locations)
		}),
	)

	router.get(
		'/:id',
		asyncHandler(async (req: Request, res: Response) => {
			const location = await locationService.getLocation(req.params.id)
			res.json(location)
		}),
	)

	router.post(
		'/:id/calculate-date',
		asyncHandler(async (req: Request, res: Response) => {
			const locationId = req.params.id
			const { temperature } = calculateDateSchema.parse(req.body)
			const date = await locationService.calculateDate(locationId, temperature)
			res.json({ date: date.toISOString() })
		}),
	)

	// Fallback error logger for any errors not caught by specific handlers
	router.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
		logger.error('Unhandled error in locations router:', err)
		next(err) // Pass to Express's default error handler or other global handlers
	})

	return router
}
