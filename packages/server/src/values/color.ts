import { Column, Entity } from 'typeorm'
import { z } from 'zod/v4'

export const RGBColorSchema = z.object({
	red: z.number(),
	green: z.number(),
	blue: z.number(),
})
export type IRGBColor = z.infer<typeof RGBColorSchema>

@Entity()
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
