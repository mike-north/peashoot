import type { Garden } from '../garden'
import { timeout } from '../../utils/promise'
import { gardens } from '../fixture-data'

export abstract class GardenAdapterBase {
	async fetchGardens(): Promise<Garden[]> {
		await timeout(200) // Fake delay to simulate network call
		return gardens
	}
}
