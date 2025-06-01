export interface RGB {
	readonly r: number
	readonly g: number
	readonly b: number
	readonly a?: number
}

export interface RGBA extends RGB {
	readonly a: number
}

export function rgbToCss(rgb: RGB): string {
	return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}
