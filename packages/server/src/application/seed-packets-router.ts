import { Router } from 'express'
import { SeedPacketsService } from '../services/seed-packets-service'
import { asyncHandler } from './middlewares/async-handler'

export function createSeedPacketRouter(): Router {
	const router = Router()
	const seedPacketsService = new SeedPacketsService()

	router.get(
		'/',
		asyncHandler(async (_req, res) => {
			const seedPackets = await seedPacketsService.getAllSeedPackets()
			res.json(seedPackets)
		}),
	)

	return router
}
