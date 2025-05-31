import type { GridPlaceable, GridPlacement } from './grid-placement'

export interface GridArea<T extends GridPlaceable> {
	id: string
	width: number
	height: number
	placements: GridPlacement<T>[]
}
