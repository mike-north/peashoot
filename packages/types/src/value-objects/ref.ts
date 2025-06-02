import { z } from 'zod/v4'

export const RefSchema = z.object({
	id: z.string(),
})

export type IRef = z.infer<typeof RefSchema>

export function refOrEmbed<T extends z.ZodType, P extends string>(idPrefix: P, kind: T) {
	return z.union([z.object({ id: z.templateLiteral([idPrefix, '_', z.string()]) }), kind])
}

export function refsOrEmbedMany<T extends z.ZodType>(embed: T) {
	return z.union([z.array(RefSchema), z.array(embed)])
}
