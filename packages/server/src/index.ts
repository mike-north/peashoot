import { SeedPacket } from './entities/seed-packet'
import { AppDataSource } from './data-source'
import * as rimraf from 'rimraf'
import { initApp } from './application/app'
import { createLogger } from './logger'
import { readSeedDataFile } from './seed-db'
import * as ld from 'lodash'
import { Logger } from 'winston'
import { SeedPacketSchema } from '@peashoot/types'

const PORT = process.env.port ?? 3000
const logger = createLogger({ level: 'debug' })

async function main(logger: Logger) {
	rimraf.sync('peashoot.sqlite')
	await AppDataSource.initialize()
	const repo = AppDataSource.getRepository(SeedPacket)
	const plants = readSeedDataFile(logger)
	await Promise.all(
		plants.map(async (pkt) => {
			const seedPacketParams = SeedPacketSchema.parse({
				name: pkt.commonName,
				description: pkt.description ?? '',
				iconPath: `${ld.kebabCase([pkt.plantFamily, pkt.commonName].join('-'))}.png`,
				plantingInstructions: pkt.plantingInstructions ?? '',
				quantity: pkt.seedPacketInfo?.seedCount ?? 100,
				netWeightGrams: (pkt.seedPacketInfo?.ntWeightInOz ?? 1) * 28.3495,
				originLocation: pkt.seedSource ?? 'USA',
				expiresAt: new Date(
					Date.now() +
						(pkt.seedPacketInfo?.viabilityYears ?? 1) * 365 * 24 * 60 * 60 * 1000,
				),
				presentation: {
					accentColor: {
						red: pkt.presentation.accentColor.red,
						green: pkt.presentation.accentColor.green,
						blue: pkt.presentation.accentColor.blue,
					},
					iconPath: pkt.presentation.iconPath,
				},
			})
			let packet = repo.create(seedPacketParams)
			packet = await repo.save(packet)
			logger.info('Seed packet saved', { pkt: packet.name, id: packet.id })
		}),
	)

	const app = initApp(logger)
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`)
	})
}

main(logger).catch(console.error)
