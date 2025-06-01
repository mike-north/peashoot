import type { SeedPacket } from '../entities/seed-packet'
import { timeout } from '../../utils/promise'
import { seedPackets } from '../fixture-data'

export abstract class SeedPacketAdapterBase {
	async fetchSeedPackets(): Promise<SeedPacket[]> {
		await timeout(200) // Fake delay to simulate network call
		return seedPackets
	}
}
