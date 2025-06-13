import { Column } from 'typeorm'
import { IXYCoordinate } from '@peashoot/types'

export class XYCoordinate implements IXYCoordinate {
	@Column('int')
	x!: number

	@Column('int')
	y!: number
}
