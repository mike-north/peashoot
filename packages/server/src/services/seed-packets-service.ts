import { SeedPacket } from '../entities/seed-packet'
import { AppDataSource } from '../data-source'
import { ListPacketsResponse } from '@peashoot/types'

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
}
