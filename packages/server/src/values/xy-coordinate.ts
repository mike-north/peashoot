import { Column } from 'typeorm'
import { IXYCoordinate } from '@peashoot/types'

export class XYCoordinate implements IXYCoordinate {
	@Column()
	x!: number

	@Column()
	y!: number
}
