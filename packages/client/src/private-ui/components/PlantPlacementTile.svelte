<script lang="ts">
import PlantGridTile from './PlantGridTile.svelte'
import type { PlantPlacement } from '../../private-lib/plant-placement'
import type { Plant } from '../../private-lib/plant'
import { plantPlacementToGridPlacement } from '../../private-lib/plant-placement'

type PlantWithSize = Plant & { size: number }

interface Props {
	placement: PlantPlacement
	plant: Plant
	cellSizePx: number
	isPulsingSource?: boolean
	showSizeBadge?: boolean
}

let {
	placement,
	plant,
	cellSizePx,
	isPulsingSource = false,
	showSizeBadge = false,
}: Props = $props()

// Calculate size in pixels
const sizePx = $derived(cellSizePx * plant.presentation.size)

// First get the base grid placement
const basePlacement = $derived(plantPlacementToGridPlacement(placement, plant))

// Convert from PlantPlacement to GridPlacement and add size property
const fullGridPlacement = $derived({
	...basePlacement,
	data: {
		...plant,
		size: plant.presentation.size,
	} as PlantWithSize,
})
</script>

<PlantGridTile
	placement={fullGridPlacement}
	sizePx={sizePx}
	isPulsingSource={isPulsingSource}
	showSizeBadge={showSizeBadge}
/>
