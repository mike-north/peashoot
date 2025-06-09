import { GardenRepository } from './garden.repository'
import { GardenFixturesRepository } from './garden-fixtures.repository'
import { PlantRepository } from './plant.repository'
import { SeedPacketRepository } from './seed-packet.repository'
import { SeedPacketFixturesRepository } from './seed-packet-fixtures.repository'
import { PlantFixturesRepository } from './plant-fixtures.repository'

// Control whether to use real API or fixture data
// Can be toggled for development/testing purposes
let useFixtures = false

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
export function getPlantRepository(): PlantRepository | PlantFixturesRepository {
	return useFixtures ? new PlantFixturesRepository() : new PlantRepository()
}

/**
 * Get the seed packet repository
 */
export function getSeedPacketRepository():
	| SeedPacketRepository
	| SeedPacketFixturesRepository {
	return useFixtures ? new SeedPacketFixturesRepository() : new SeedPacketRepository()
}
