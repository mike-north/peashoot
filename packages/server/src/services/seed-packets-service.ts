import { SeedPacket } from '../entities/seed-packet'
import { AppDataSource } from '../data-source'
import { ListPacketsResponse, stringToDistanceUnit } from '@peashoot/types'
import { RawSeedPacketInfo } from '../../data/raw-seed-info'
import { Repository } from 'typeorm'
import * as ld from 'lodash'

export class SeedPacketsService {
	async getAllSeedPackets(): Promise<ListPacketsResponse> {
		const packets = await AppDataSource.manager.find(SeedPacket)
		return packets.map((packet) => ({
			id: packet.id,
			category: packet.plantFamily,
			variant: packet.plantFamily,
			name: packet.name,
			description: packet.description,
			expiresAt: packet.expiresAt.toISOString(),
			presentation: {
				iconPath: packet.presentation.iconPath,
				accentColor: packet.presentation.accentColor,
			},
			metadata: {
				quantity: packet.quantity,
				plantingInstructions: packet.plantingInstructions,
				plantingDistance: packet.plantingDistance,
				netWeightGrams: packet.netWeightGrams,
				originLocation: packet.originLocation,
			},
		}))
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
			plantingInstructions: pkt.plantingInstructions ?? '',
			quantity: pkt.seedPacketInfo?.seedCount ?? 100,
			netWeightGrams: (pkt.seedPacketInfo?.ntWeightInOz ?? 1) * 28.3495,
			originLocation: pkt.seedSource ?? 'USA',
			plantFamily: pkt.plantFamily,
			plantingDistance: {
				value: pkt.spacing.optimal.value,
				unit: stringToDistanceUnit(pkt.spacing.optimal.unit),
			},
			expiresAt: new Date(
				Date.now() +
					(pkt.seedPacketInfo?.viabilityYears ?? 1) * 365 * 24 * 60 * 60 * 1000,
			),
		})
		return packet
	}
}
