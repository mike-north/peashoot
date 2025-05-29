export interface Plant {
	readonly id: string
	readonly name: string
	readonly icon: string
	readonly size: number
	readonly plantFamily: {
		name: string
		colorVariant: string
	}
}
