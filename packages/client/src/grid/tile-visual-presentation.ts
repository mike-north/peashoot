import type { GridPlaceable } from './grid-placement'

export interface TileVisualPresentation {
	readonly accentColor: {
		r: number
		g: number
		b: number
		a?: number
	}
	readonly size: number
	readonly iconPath: string
}

export interface WithVisualPresentation extends GridPlaceable {
	presentation: TileVisualPresentation
}
