import { Column, Entity } from 'typeorm'
import { RGBColor } from '../values/rgb-color.js'

@Entity()
export class Presentation {
	@Column(() => RGBColor)
	accentColor!: RGBColor

	@Column()
	iconPath!: string
}
