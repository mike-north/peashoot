import chalk from 'chalk'
import winston from 'winston'

interface LoggerOptions {
	level: 'info' | 'debug' | 'warn' | 'error'
}

export function colorizeLevel(message: string, level: LoggerOptions['level']) {
	switch (level) {
		case 'info':
			return `\x1b[32m${message}\x1b[0m`
		case 'debug':
			return `\x1b[34m${message}\x1b[0m`
		case 'warn':
			return `\x1b[33m${message}\x1b[0m`
		case 'error':
			return `\x1b[31m${message}\x1b[0m`
	}
}

export function createLogger(options: LoggerOptions) {
	const logger = winston.createLogger({
		level: options.level,
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.colorize(),
			winston.format.printf((info) => {
				const { level, message, timestamp, ...meta } = info
				const time = typeof timestamp === 'string' ? timestamp : '--'
				const mes = typeof message === 'string' ? message : '--'
				return `[${colorizeLevel(level, options.level)}] ${chalk.grey(time)}: ${mes} ${
					Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
				}`
			}),
		),
		transports: [new winston.transports.Console()],
	})

	return logger
}
