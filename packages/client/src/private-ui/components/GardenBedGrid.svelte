<script lang="ts">
import Grid from './Grid.svelte'
import type { GridPlaceable } from '../../grid/grid-placement'
import type { Component } from 'svelte'
import type { GardenBed } from '../../private-lib/garden-bed'
import type { Plant } from '../../private-lib/plant'
import HorizontalBarMeter from './HorizontalBarMeter.svelte'

interface GardenBedGridProps {
	bed: GardenBed
	plants: Plant[]
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

// Map colSpan number to Tailwind class
const colSpanClass = $derived(
	(() => {
		switch (colSpan) {
			case 1:
				return 'col-span-1'
			case 2:
				return 'col-span-2'
			case 3:
				return 'col-span-3'
			case 4:
				return 'col-span-4'
			case 5:
				return 'col-span-5'
			default:
				return 'col-span-1'
		}
	})(),
)
</script>

<style lang="scss">
.raised-bed {
	.meters-row {
		display: flex;
		flex-direction: row;
		gap: 17px;
		justify-content: left;
		align-items: center;
		margin-bottom: 1em;
		margin-top: 0;
	}
}
</style>

<div class="raised-bed card bg-base-100 shadow-sm {colSpanClass} {rest.class || ''}">
	<Grid
		grid={bed}
		TooltipComponent={TooltipComponent}
		items={plants}
		edgeIndicators={edgeIndicators}
		tileSizeForItem={tileSizeForItem}
	/>
	<div class="card-body">
		<div class="card-title">
			Raised Garden Bed ({bed.width}×{bed.height} feet)
		</div>
		<div class="meters-row">
			<HorizontalBarMeter
				id={`${bed.id}-water`}
				value={bed.waterLevel}
				max={5}
				filledColor="#3498db"
				emptyColor="#3498db22"
				borderColor="#3498db"
				label="Water"
				labelColor="#3498db"
			/>
			<HorizontalBarMeter
				id={`${bed.id}-sun`}
				value={bed.sunLevel}
				max={5}
				filledColor="#FFD600"
				emptyColor="#FFD60022"
				borderColor="#FFD600"
				label="Sun"
				labelColor="#FF6666"
			/>
		</div>
	</div>
</div>
