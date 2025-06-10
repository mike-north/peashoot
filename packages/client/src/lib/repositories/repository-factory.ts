import { WorkspaceRepository } from './workspace.repository'
import { ItemRepository } from './plant.repository'
import { SeedPacketRepository } from './seed-packet.repository'

/**
 * Get the appropriate garden repository based on current setting
 */
export function getWorkspaceRepository(): WorkspaceRepository {
	return new WorkspaceRepository()
}

/**
 * Get the plant repository
 */
export function getItemRepository(): ItemRepository {
	return new ItemRepository()
}

/**
 * Get the seed packet repository
 */
export function getPacketRepository(): SeedPacketRepository {
	return new SeedPacketRepository()
}
