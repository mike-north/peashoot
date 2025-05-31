<script lang="ts">
import type { GridPlaceable } from '../grid/grid-placement'
import { isPlant } from '../private-lib/plant'

interface Props {
	item: GridPlaceable
}

let { item }: Props = $props()
</script>

<style lang="scss">
.plant-tooltip-content {
	width: 400px;
	max-height: 350px;
	overflow-y: auto;
}
</style>

<div class="plant-tooltip-content">
	<div class="plant-tooltip-content__header flex items-center gap-3 mb-3">
		{#if item.presentation.iconPath}
			<img
				src={'/plant-icons/' + item.presentation.iconPath}
				alt={item.displayName}
				class="w-12 h-12 rounded-lg"
			/>
		{/if}
		<div>
			<h3 class="text-lg font-semibold text-gray-800">{item.displayName}</h3>
			<p class="text-sm text-gray-600">
				Size: {item.presentation.size}×{item.presentation.size} grid spaces
			</p>
			{#if isPlant(item)}
				{#if item.family}
					<p class="text-xs text-gray-500 italic">Family: {item.family}</p>
				{/if}
			{/if}
		</div>
	</div>

	<div class="plant-tooltip-content__details space-y-2">
		<div class="flex items-center gap-2">
			<span
				class="w-3 h-3 rounded border border-gray-300"
				style={`background-color: rgba(${item.presentation.accentColor.r}, ${item.presentation.accentColor.g}, ${item.presentation.accentColor.b}, ${item.presentation.accentColor.a ?? 0.6})`}
			></span>
			<span class="text-sm text-gray-700">Accent Color</span>
		</div>

		<div class="text-sm text-gray-600">
			<p><strong>ID:</strong> {item.id}</p>
		</div>
	</div>

	<!-- Example of larger content area -->
	<div class="plant-tooltip-content__description mt-4 p-3 bg-gray-50 rounded-lg">
		<h4 class="text-sm font-medium text-gray-800 mb-2">Description</h4>
		<p class="text-sm text-gray-600 leading-relaxed">
			This is an example tooltip content area that demonstrates how the tooltip can handle
			larger content. The positioning logic will automatically adjust the tooltip
			orientation based on available viewport space and whether the tile is in a toolbar
			dropdown.
		</p>
		<div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
			<div>Category: Plant</div>
			<div>Type: Grid Item</div>
			<div>Draggable: Yes</div>
			<div>Resizable: No</div>
		</div>
	</div>
</div>
