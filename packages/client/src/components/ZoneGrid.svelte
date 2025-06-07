<script lang="ts">
import Grid from '../private/grid/components/Grid.svelte'
import type { GridPlaceable } from '../private/grid/grid-placement'
import type { Zone } from '../lib/entities/zone'
import HorizontalBarMeter from './HorizontalBarMeter.svelte'
import IdLabel from '../lib/components/IdLabel.svelte'
import type { Item } from '../lib/entities/item'
import type { Indicator } from '../lib/entities/indicator'

interface ZoneGridProps {
	zone: Zone
	items: Item[]
	/** New flexible indicator system */
	indicators?: Indicator[]
	tileSizeForItem: (item: GridPlaceable) => number
	colSpan?: number
	[k: string]: unknown
}

const {
	zone,
	items,
	indicators = [],
	tileSizeForItem,
	colSpan = 1,
	...rest
}: ZoneGridProps = $props()

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
.zone-container {
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

<div class="zone-container card bg-base-100 shadow-sm {colSpanClass} {rest.class || ''}">
	<Grid
		grid={zone}
		items={items}
		indicators={indicators}
		tileSizeForItem={tileSizeForItem}
	/>
	<div class="card-body">
		<div class="card-title flex justify-between items-center">
			Work Zone ({zone.width}×{zone.height} units)
			<IdLabel id={zone.id} />
		</div>

		<div class="meters-row">
			<HorizontalBarMeter
				id={`${zone.id}-water`}
				value={zone.waterLevel}
				max={5}
				filledColor="#3498db"
				emptyColor="#3498db22"
				borderColor="#3498db"
				label="Water"
				labelColor="#3498db"
			/>
			<HorizontalBarMeter
				id={`${zone.id}-sun`}
				value={zone.sunLevel}
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
