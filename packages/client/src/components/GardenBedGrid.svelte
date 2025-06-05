<script lang="ts">
// This file now redirects to the new ZoneGrid with generic terminology
// The old garden-bed-specific implementation is preserved but uses the new zone system
import ZoneGrid from './ZoneGrid.svelte'
import type { GridPlaceable } from '../private/grid/grid-placement'
import type { Component } from 'svelte'
import type { GardenBed } from '../lib/entities/garden-bed'
import type { PlantItem } from '../lib/item-types/plant-item'

interface GardenBedGridProps {
	bed: GardenBed
	plants: PlantItem[]
	TooltipComponent: Component<{ item: GridPlaceable }>
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
	tileSizeForItem: (item: GridPlaceable) => number
	colSpan?: number
	[k: string]: unknown
}

const {
	bed,
	plants,
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
	{plants}
	{TooltipComponent}
	edgeIndicators={edgeIndicators.map(indicator => ({
		id: indicator.id,
		itemAId: indicator.plantAId,
		itemBId: indicator.plantBId,
		color: indicator.color
	}))}
	{tileSizeForItem}
	{colSpan}
	{...rest}
/>
