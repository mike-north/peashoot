import { stringToDistanceUnit, type IDistance, type IDistanceUnit } from '@peashoot/types'
import { Column } from 'typeorm'

export class Distance implements IDistance {
	@Column()
	value!: number

	@Column('varchar', {
		transformer: {
			to: (value: IDistanceUnit): string => value,
			from: stringToDistanceUnit,
		},
	})
	unit!: IDistanceUnit
}
