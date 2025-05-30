import type { Garden } from '../../private-lib/garden'
import { timeout } from '../../utils/promise'
import { gardens } from '../fixture-data'
import { GardenAdapterBase } from './garden-adapter-base'

export class GardenAdapter extends GardenAdapterBase {
	override async fetchGardens(): Promise<Garden[]> {
		await timeout(300) // Fake delay to simulate network call
		return gardens
	}
}
