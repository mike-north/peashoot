import type { ItemPlacement } from '@peashoot/types'
import type { WithId } from '../../lib/entities/with-id'

export interface GridArea extends WithId {
	width: number
	height: number
	placements: ItemPlacement[]
}
