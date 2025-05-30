export type BaseId<Prefix extends string> = `${Prefix}_${string}`

export interface BaseEntity<IdType extends BaseId<string>> {
	id: IdType
}
