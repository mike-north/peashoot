import { Column } from 'typeorm'
import { Temperature as ITemperature, TemperatureUnit } from '@peashoot/types'

export class Temperature implements ITemperature {
	@Column()
	value!: number

	@Column()
	unit!: TemperatureUnit
}
