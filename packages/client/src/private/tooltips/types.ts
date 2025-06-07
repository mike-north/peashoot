import type { Indicator } from '../../lib/entities/indicator'
import type { IndicatorVisual } from '../grid/zone-layout-calculator'

export type IndicatorForTooltip = Indicator & Partial<IndicatorVisual>

export function isIndicator(item: unknown): item is IndicatorForTooltip {
	return (
		typeof item === 'object' &&
		item !== null &&
		'effects' in item &&
		'position' in item
	)
} 