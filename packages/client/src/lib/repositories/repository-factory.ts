import { GardenRepository } from './garden.repository'
import { GardenFixturesRepository } from './garden-fixtures.repository'
import { PlantRepository } from './plant.repository'
import { SeedPacketRepository } from './seed-packet.repository'

// Control whether to use real API or fixture data
// Can be toggled for development/testing purposes
let useFixtures = true

/**
 * Set whether to use fixtures (true) or real API (false)
 */
export function setUseFixtures(value: boolean): void {
	useFixtures = value
}

/**
 * Get the appropriate garden repository based on current setting
 */
export function getGardenRepository(): GardenRepository | GardenFixturesRepository {
	return useFixtures ? new GardenFixturesRepository() : new GardenRepository()
}

/**
 * Get the plant repository
 */
export function getPlantRepository(): PlantRepository {
	// Currently only have a real API version
	return new PlantRepository()
}

/**
 * Get the seed packet repository
 */
export function getSeedPacketRepository(): SeedPacketRepository {
	// Currently only have a real API version
	return new SeedPacketRepository()
}
