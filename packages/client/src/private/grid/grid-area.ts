import type { WithId } from '../../lib/entities/with-id'
import type { GridPlaceable, GridPlacement } from './grid-placement'

export interface GridArea<T extends GridPlaceable> extends WithId {
	width: number
	height: number
	placements: GridPlacement<T>[]
}
