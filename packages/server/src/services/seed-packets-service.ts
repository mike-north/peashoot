import { SeedPacket } from '../entities/seed-packet'
import { AppDataSource } from '../data-source'
import { RawSeedPacketInfo } from '../../data/raw-seed-info'
import { Repository } from 'typeorm'
import * as ld from 'lodash'
import { stringToDistanceUnit } from '@peashoot/types'

export class SeedPacketsService {
	async getAllSeedPackets(): Promise<SeedPacket[]> {
		return await AppDataSource.manager.find(SeedPacket)
	}

	parseSeedPacket(repo: Repository<SeedPacket>, pkt: RawSeedPacketInfo): SeedPacket {
		const packet: SeedPacket = repo.create({
			name: pkt.commonName,
			description: pkt.description ?? '',
			presentation: {
				accentColor: {
					red: pkt.presentation.accentColor.red,
					green: pkt.presentation.accentColor.green,
					blue: pkt.presentation.accentColor.blue,
				},
				iconPath: `${ld.kebabCase([pkt.plantFamily, pkt.commonName].join('-'))}.png`,
			},
			category: pkt.plantFamily,
			quantity: pkt.seedPacketInfo?.seedCount ?? 100,
			expiresAt: new Date(
				2024 + (pkt.seedPacketInfo?.viabilityYears ?? 2),
				2,
				1,
			).toISOString(),
			plantingDistance: {
				value: pkt.spacing.optimal.value,
				unit: stringToDistanceUnit(pkt.spacing.optimal.unit),
			},
		})
		return packet
	}
}
