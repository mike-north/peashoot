export type BaseId<Prefix extends string> = `${Prefix}_${string}`

export interface BaseEntity<IdPrefix extends string> {
	id: BaseId<IdPrefix>
}
