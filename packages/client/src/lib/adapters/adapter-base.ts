import { assertNonEmpty } from '../types/guards'

export type AdapterFeatureState = 'enabled' | 'disabled'

export abstract class AdapterBase<
	AdapterFeatures extends Record<string, AdapterFeatureState>,
> {
	private readonly features: AdapterFeatures

	constructor(features: AdapterFeatures) {
		this.features = features
	}

	hasFeature(feature: keyof AdapterFeatures): boolean {
		return feature in this.features
	}

	getFeatureState(feature: keyof AdapterFeatures): string {
		const flag = this.features[feature]
		assertNonEmpty(flag)
		return flag
	}
}
