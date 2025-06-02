import { Router } from 'express'
import { createGardenRouter } from './gardens-router'
import { createPlantRouter } from './plants-router'
import { createSeedPacketRouter } from './seed-packets-router'
import { zodErrorTo400 } from './middlewares/zod-error-to-400'
import { Logger } from 'winston'
import cors from 'cors'

export function createRouter(_logger: Logger): Router {
	const router = Router()
	router.use(cors({ origin: '*' }))
	router.use(zodErrorTo400)
	router.use('/gardens', createGardenRouter())
	router.use('/plants', createPlantRouter())
	router.use('/seed-packets', createSeedPacketRouter())

	return router
}
