import type { Color } from './value-objects/color'

export interface TilePresentation {
	readonly bgColor: Color
	readonly fgColor: Color
	readonly size: number
	readonly iconPath: string
}
