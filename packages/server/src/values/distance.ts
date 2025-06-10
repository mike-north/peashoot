import { IDistance } from '@peashoot/types'
import { Column } from 'typeorm'

export type DistanceUnit = 'inches' | 'feet' | 'yards' | 'meters' | 'centimeters'

export function isDistanceUnit(value: string): value is DistanceUnit {
	return ['inches', 'feet', 'yards', 'meters', 'centimeters'].includes(value)
}

export function stringToDistanceUnit(value: string): DistanceUnit {
	if (isDistanceUnit(value)) {
		return value
	}
	throw new Error(`Invalid distance unit: ${value}`)
}

export class Distance implements IDistance {
	@Column()
	value!: number

	@Column('varchar', {
		transformer: {
			to: (value: DistanceUnit): string => value as string,
			from: stringToDistanceUnit,
		},
	})
	unit!: DistanceUnit
}
