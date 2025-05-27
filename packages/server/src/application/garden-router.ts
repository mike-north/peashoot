import { Router } from 'express'

export function createGardenRouter(): Router {
	const router = Router()

	router.get('/', (req, res) => {
		res.send('Hello World')
	})

	return router
}
