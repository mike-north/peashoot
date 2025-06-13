import { Router, Request, Response, NextFunction } from 'express'
import { createGardenRouter } from './gardens-router.js'
import { createPlantRouter } from './plants-router.js'
import { createSeedPacketRouter } from './seed-packets-router.js'
import { zodErrorTo400 } from './middlewares/zod-error-to-400.js'
import { Logger } from 'winston'
import cors from 'cors'
import bodyParser from 'body-parser'

import { createLocationRouter } from './locations-router.js'

export function createRouter(logger: Logger): Router {
	const router = Router()
	router.use(cors({ origin: '*' }))
	router.use(bodyParser.json())
	router.use(zodErrorTo400(logger))
	router.use('/workspaces', createGardenRouter(logger))
	router.use('/items', createPlantRouter(logger))
	router.use('/packets', createSeedPacketRouter(logger))
	router.use('/locations', createLocationRouter(logger))

	// Fallback error logger for any errors not caught by specific handlers
	router.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
		logger.error('Unhandled error in API router:', err)
		next(err) // Pass to Express's default error handler or other global handlers
	})

	return router
}
