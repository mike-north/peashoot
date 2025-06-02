import { IDistance } from '@peashoot/types'
import { Column } from 'typeorm'

export enum DistanceUnit {
	Inches = 'inches',
	Feet = 'feet',
	Yards = 'yards',
	Meters = 'meters',
	Centimeters = 'centimeters',
}

export function isDistanceUnit(value: string): value is DistanceUnit {
	return Object.values(DistanceUnit).includes(value as DistanceUnit)
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
