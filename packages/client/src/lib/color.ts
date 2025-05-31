export interface RGB {
	readonly r: number
	readonly g: number
	readonly b: number
	readonly a?: number
}

export interface RGBA extends RGB {
	readonly a: number
}
