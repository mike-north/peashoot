import express, { Express, RequestHandler } from 'express'
import { createRouter } from './api-router.js'
import { Logger } from 'winston'

function createRequestLogger(logger: Logger): RequestHandler {
	return (req, res, next) => {	
		logger.info(`${req.method} ${req.url}`)
		next()
	}
}

export function initApp(logger: Logger): Express {
	const app = express()
	app.use('*', createRequestLogger(logger))
	app.use(express.json())
	app.use('/api', createRouter(logger))

	return app
}
