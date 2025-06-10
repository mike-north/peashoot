import { Router } from 'express'
import { SeedPacketsService } from '../services/seed-packets-service'
import { asyncHandler } from './middlewares/async-handler'
import { Logger } from 'winston'
import {
	convertDistanceToFeet,
	ListPacketsResponse,
	SeedPacketMetadata,
} from '@peashoot/types'

export function createSeedPacketRouter(logger: Logger): Router {
	const router = Router()
	const seedPacketsService = new SeedPacketsService()

	router.get(
		'/',
		asyncHandler(async (_req, res) => {
			try {
				const packets = await seedPacketsService.getAllSeedPackets()
				const response: ListPacketsResponse = packets.map((packet) => ({
					id: packet.id,
					category: packet.category,
					name: packet.name,
					description: packet.description,
					presentation: {
						iconPath: packet.presentation.iconPath,
						accentColor: packet.presentation.accentColor,
					},
					metadata: {
						quantity: packet.quantity,
						daysToHarvest: 30,
						plantingDistance: convertDistanceToFeet(packet.plantingDistance).value,
						expiresAt: packet.expiresAt,
					} satisfies SeedPacketMetadata,
				}))
				res.json(response)
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
