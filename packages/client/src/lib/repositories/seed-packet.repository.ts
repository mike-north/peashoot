import type { SeedPacket } from '../entities/seed-packet'
import type { ISeedPacket } from '@peashoot/types'
import { Repository } from './repository.base'

type SeedPacketResource = ISeedPacket & { id: string }

/**
 * Repository for SeedPacket domain entities
 * Handles data access and persistence for SeedPacket entities
 */
export class SeedPacketRepository extends Repository<SeedPacket, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'seed-packets'
	}

	protected toDomainEntity(resource: unknown): SeedPacket {
		const seedPacket = resource as SeedPacketResource

		return {
			...seedPacket,
			id: seedPacket.id as `seedp_${string}`,
		}
	}

	protected toResource(entity: SeedPacket): unknown {
		// Return the entity directly, removing any domain-specific transformations if needed
		return entity
	}
}
