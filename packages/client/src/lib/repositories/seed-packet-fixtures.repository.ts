import type { SeedPacket } from '../entities/seed-packet'
import { seedPackets } from '../fixture-data'
import type { ISeedPacketRepository } from './seed-packet.repository'

/**
 * Repository for SeedPacket domain entities that uses fixture data
 * Used for testing and development
 */
export class SeedPacketFixturesRepository implements ISeedPacketRepository {
	/**
	 * Fetch all seed packets from fixtures
	 */
	async findAll(): Promise<SeedPacket[]> {
		// Mock implementation with fixture data
		return Promise.resolve(seedPackets)
	}
}
