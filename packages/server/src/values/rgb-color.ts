import { IRGBColor } from '@peashoot/types'
import { Column } from 'typeorm'

export class RGBColor implements IRGBColor {
	@Column('int')
	red!: number

	@Column('int')
	green!: number

	@Column('int')
	blue!: number

	@Column({ type: 'float', default: 1 })
	alpha!: number
}
