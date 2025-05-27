import { Router } from 'express'
import { createGardenRouter } from './garden-router'

export function createRouter(): Router {
	const router = Router()

	router.use('/garden', createGardenRouter())

	return router
}
