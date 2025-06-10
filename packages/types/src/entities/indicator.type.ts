import { z } from 'zod/v4'

export const IndicatorEffectSchema = z.object({
	description: z.string(),
	sourceId: z.string(),
	targetId: z.string(),
})

export const IndicatorSchema = z.object({
	id: z.string(),
	effects: z.array(IndicatorEffectSchema),
})

export type Indicator = z.infer<typeof IndicatorSchema>
export type IndicatorEffect = z.infer<typeof IndicatorEffectSchema>
