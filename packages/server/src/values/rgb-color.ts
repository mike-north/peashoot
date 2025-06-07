import { IRGBColor } from '@peashoot/types'
import { Column } from 'typeorm'

export class RGBColor implements IRGBColor {
	@Column()
	red!: number

	@Column()
	green!: number

	@Column()
	blue!: number

	@Column({ default: 1 })
	alpha!: number
}
