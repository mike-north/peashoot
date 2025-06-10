import { z } from 'zod/v4'

export const IndicatorEffectSchema = z.object({
	sourceItemTypeId: z.string(),
	targetItemTypeId: z.string(),
	nature: z.enum(['beneficial', 'harmful', 'neutral']),
	description: z.string(),
})

export const IndicatorSchema = z.object({
	id: z.string(),
	effects: z.array(IndicatorEffectSchema),
})

export type Indicator = z.infer<typeof IndicatorSchema>
export type IndicatorEffect = z.infer<typeof IndicatorEffectSchema>