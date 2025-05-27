import express, { Express } from 'express'
import { createRouter } from './api-router'

export function initApp(): Express {
	const app = express()
	app.use(express.json())

	app.use('/api', createRouter())

	app.get('/', (req, res) => {
		res.send("I'm alive!")
	})

	return app
}
