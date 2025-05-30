export interface Color {
	readonly r: number
	readonly g: number
	readonly b: number
	readonly a?: number
}
export function colorHashToCss(color: Color): string {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 0.4})`
}
