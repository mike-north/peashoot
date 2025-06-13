import { Router } from 'express'
import { GardensService } from '../services/gardens-service.js'
import { asyncHandler } from './middlewares/async-handler.js'
import { Logger } from 'winston'
import { ListWorkspacesResponse } from '@peashoot/types'

export function createGardenRouter(_logger: Logger): Router {
	const gardensService = new GardensService()
	const router = Router()

	router.get(
		'/',
		asyncHandler(async (_req, res, _next) => {
			const gardens = await gardensService.getAllGardens()
			const response = gardens.map((garden) => ({
				id: garden.id,
				name: garden.name,
				description: garden.description,
				indicators: [],
				zones: [],
				metadata: {},
			})) satisfies ListWorkspacesResponse
			res.json(response)
		}),
	)
	return router
}
