import { SeedPacketSchema, type SeedPacket } from '@peashoot/types'
import { Repository } from './repository.base'

export interface ISeedPacketRepository {
	findAll(): Promise<SeedPacket[]>
}

/**
 * Repository for SeedPacket domain entities
 * Handles data access and persistence for SeedPacket entities
 */
export class SeedPacketRepository extends Repository<SeedPacket, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'packets'
	}

	protected toDomainEntity(resource: unknown): SeedPacket {
		return SeedPacketSchema.parse(resource)
	}

	/**
	 * Fetch all seed packets
	 * Provides the same interface as the previous adapter for compatibility
	 */
	async fetchSeedPackets(): Promise<SeedPacket[]> {
		return this.findAll()
	}
}
