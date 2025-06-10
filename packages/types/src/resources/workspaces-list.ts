import { z } from 'zod/v4'
import { GardenSchema } from '../entities/garden.type.js'

export const ListWorkspacesRequestSchema = z.object({})
export const ListWorkspacesResponseSchema = z.array(GardenSchema)

export type ListWorkspacesRequest = z.infer<typeof ListWorkspacesRequestSchema>
export type ListWorkspacesResponse = z.infer<typeof ListWorkspacesResponseSchema>
