import { Column, Entity } from 'typeorm'
import { IXYCoordinate } from '@peashoot/types'

@Entity()
export class XYCoordinate implements IXYCoordinate {
	@Column()
	x!: number

	@Column()
	y!: number
}
