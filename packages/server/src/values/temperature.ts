import { Temperature as ITemperature } from '@peashoot/types'
import { Column } from 'typeorm'

export class Temperature implements ITemperature {
	@Column('number')
	value!: number

	@Column('char')
	unit!: 'C' | 'F'
}
