<script lang="ts">
import type { Plant } from '../private-lib/plant'

interface Props {
	item: Plant
}

let { item: plant }: Props = $props()
</script>

<img
	src={`plant-icons/${plant.presentation.iconPath}`}
	alt={plant.displayName}
	class="w-20 h-20 object-contain mb-2"
/>
<div class="font-bold text-lg">{plant.displayName}</div>
<div class="text-sm text-gray-500">
	Family: <span class="font-medium text-gray-700">{plant.family}</span>
</div>
<div class="text-sm text-gray-500">
	Variant: <span class="font-medium text-gray-700">{plant.variant}</span>
</div>
<div class="text-sm text-gray-500">
	Planting Distance: <span class="font-medium text-gray-700">{plant.size} ft</span>
</div>
