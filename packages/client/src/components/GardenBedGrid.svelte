<script lang="ts">
// This file now redirects to the new ZoneGrid with generic terminology
// The old garden-bed-specific implementation is preserved but uses the new zone system
import ZoneGrid from './ZoneGrid.svelte'
import type { GridPlaceable } from '../private/grid/grid-placement'
import type { Component } from 'svelte'
import type { EdgeIndicator } from '../lib/entities/workspace'
import type { Zone } from '../lib/entities/zone'
import type { Item } from '../lib/entities/item'

interface GardenBedGridProps {
	zone: Zone
	items: Item[]
	TooltipComponent: Component<{ item: GridPlaceable }>
	edgeIndicators: EdgeIndicator[]
	tileSizeForItem: (item: GridPlaceable) => number
	colSpan?: number
	[k: string]: unknown
}

const {
	zone: bed,
	items: plants,
	TooltipComponent,
	edgeIndicators,
	tileSizeForItem,
	colSpan = 1,
	...rest
}: GardenBedGridProps = $props()
</script>

<!-- Garden bed grid now uses the generic zone system -->
<ZoneGrid
	zone={bed}
	items={plants}
	TooltipComponent={TooltipComponent}
	edgeIndicators={edgeIndicators.map((indicator) => ({
		id: indicator.id,
		itemAId: indicator.itemAId,
		itemBId: indicator.itemBId,
		color: indicator.color,
	}))}
	tileSizeForItem={tileSizeForItem}
	colSpan={colSpan}
	{...rest}
/>
