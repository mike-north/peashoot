import { Router } from 'express'
import { SeedPacketsService } from '../services/seed-packets-service'
import { asyncHandler } from './middlewares/async-handler'
import { Logger } from 'winston'

export function createSeedPacketRouter(logger: Logger): Router {
	const router = Router()
	const seedPacketsService = new SeedPacketsService()

	router.get(
		'/',
		asyncHandler(async (_req, res) => {
			try {
				const seedPackets = await seedPacketsService.getAllSeedPackets()
				res.json(seedPackets)
			} catch (error) {
				logger.error('Error in GET /seed-packets:', error)
				// We'll let the asyncHandler and global error handlers deal with the response
				// but we want to ensure it's logged.
				throw error
			}
		}),
	)

	return router
}
