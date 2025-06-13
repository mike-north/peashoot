import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { asyncHandler } from './middlewares/async-handler.js'
import { LocationService } from '../services/location.js'
import { Logger } from 'winston'
import { InvalidArgsError } from './errors/invalid-args-error.js'

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
			const { params: { id } } = req
			if (!id) throw new InvalidArgsError('Location ID is required')
			const location = await locationService.getLocation(id)
			res.json(location)
		}),
	)

	router.post(
		'/:id/calculate-date',
		asyncHandler(async (req: Request, res: Response) => {
			const { params: { id } } = req
			if (!id) throw new InvalidArgsError('Location ID is required')
			const { temperature } = calculateDateSchema.parse(req.body)
			const date = await locationService.calculateDate(id, temperature)
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
