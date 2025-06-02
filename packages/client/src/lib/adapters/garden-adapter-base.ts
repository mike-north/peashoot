import type { Garden } from '../entities/garden'
import { timeout } from '../../utils/promise'
import { gardens } from '../fixture-data'

export class GardenAdapterBase {
	async fetchGardens(): Promise<Garden[]> {
		await timeout(300) // Fake delay to simulate network call
		return gardens
	}
	async fetchFirstGarden(): Promise<Garden> {
		const gardens = await this.fetchGardens()
		return gardens[0]
	}
}
