import { z } from 'zod/v4'
import { ItemSchema } from '../entities/item.type.js'

export const ListItemsRequestSchema = z.object({})
export const ListItemsResponseSchema = z.array(ItemSchema)

export type ListItemsRequest = z.infer<typeof ListItemsRequestSchema>
export type ListItemsResponse = z.infer<typeof ListItemsResponseSchema>
