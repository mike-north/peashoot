import { z } from 'zod/v4'
import { LocationSchema } from '../entities/location.type.js'

export const ListLocationsRequestSchema = z.object({})
export const ListLocationsResponseSchema = z.array(LocationSchema)

export type ListLocationsRequest = z.infer<typeof ListLocationsRequestSchema>
export type ListLocationsResponse = z.infer<typeof ListLocationsResponseSchema>
