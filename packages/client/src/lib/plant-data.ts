import { timeout } from '../utils/promise'
import type { Plant } from './plant'
import { plants } from './fixture-data'

export async function fetchPlants(): Promise<Plant[]> {
	await timeout(300) // Fake delay to simulate network call
	return plants
}
