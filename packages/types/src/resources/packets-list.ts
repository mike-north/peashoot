import { z } from 'zod/v4'
import { SeedPacketSchema } from '../entities/seed-packet.type.js'

export const ListPacketsRequestSchema = z.object({})
export const ListPacketsResponseSchema = z.array(SeedPacketSchema)

export type ListPacketsRequest = z.infer<typeof ListPacketsRequestSchema>
export type ListPacketsResponse = z.infer<typeof ListPacketsResponseSchema>
