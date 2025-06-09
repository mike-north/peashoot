import type { WithId } from './with-id'

export interface Location extends WithId {
	name: string
	region: string
	country: string
	monthlyTemperatures: {
		month: number
		temperature: number
		unit: 'C' | 'F'
	}[]
}
