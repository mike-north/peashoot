<script lang="ts">
import { rgbToCss } from '@peashoot/types'
import { isGridPlaceable, type GridPlaceable } from '../private/grid/grid-placement'
import { isItem, isItemWithMetadata } from './entities/item'
import { isPlantMetadata } from './entities/plant-metadata'
import IdLabel from './components/IdLabel.svelte'

export interface Props {
	item: Partial<GridPlaceable> | null
}

let { item }: Props = $props()

// Create a reactive guard that safely handles both GridPlaceable items and other objects
const isReady = $derived(
	item &&
		typeof item === 'object' &&
		isGridPlaceable(item) &&
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		!!item.presentation &&
		'accentColor' in item.presentation,
)
// Get plant-specific properties if this is a plant item, guarded by isReady
const plantProperties = $derived(
	isReady && isItem(item) && isItemWithMetadata(item, isPlantMetadata)
		? item.metadata
		: null,
)
const itemData = $derived(isReady && isItem(item) ? item : null)
</script>

<style lang="scss">
.item-tooltip-content {
	width: 400px;
	max-height: 350px;
	overflow-y: auto;
}
</style>

{#if isReady}
	<div class="item-tooltip-content">
		<div class="item-tooltip-content__header flex items-center gap-3 mb-3">
			{#if item?.presentation?.iconPath}
				<img
					src={'/plant-icons/' + item.presentation.iconPath}
					alt={item.displayName}
					class="w-12 h-12 rounded-lg"
				/>
			{/if}
			<div>
				<h3 class="text-lg font-semibold text-gray-800">{item?.displayName}</h3>
				<IdLabel id={item?.id ?? '---'} />

				<p class="text-sm text-gray-600">
					Size: {item?.size}×{item?.size} grid spaces
				</p>
				{#if plantProperties}
					<p class="text-xs text-gray-500 italic">Family: {plantProperties.family}</p>
					<p class="text-xs text-gray-500 italic">
						Planting Distance: {plantProperties.plantingDistanceInFeet} feet
					</p>
				{/if}
				{#if itemData}
					<p class="text-xs text-gray-500 italic">Category: {itemData.category}</p>
					{#if itemData.variant}
						<p class="text-xs text-gray-500 italic">Variant: {itemData.variant}</p>
					{/if}
				{/if}
			</div>
		</div>

		<div class="item-tooltip-content__details space-y-2">
			<div class="flex items-center gap-2">
				<span
					class="w-3 h-3 rounded border border-gray-300"
					style="background-color: {rgbToCss(
						item?.presentation?.accentColor ?? { red: 0, green: 0, blue: 0 },
					)}"
				></span>
				<span class="text-sm text-gray-700">Accent Color</span>
			</div>

			<div class="text-sm text-gray-600">
				<p><strong>ID:</strong> {item?.id}</p>
			</div>
		</div>

		<!-- Example of larger content area -->
		<div class="item-tooltip-content__description mt-4 p-3 bg-gray-50 rounded-lg">
			<h4 class="text-sm font-medium text-gray-800 mb-2">Description</h4>
			<p class="text-sm text-gray-600 leading-relaxed">
				This tooltip displays information about workspace items. The content adapts based
				on the item type - showing plant-specific information for plants, or generic item
				properties for other types. The positioning logic automatically adjusts the
				tooltip orientation based on available viewport space.
			</p>
			<div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
				<div>Type: {plantProperties ? 'Plant' : 'Generic Item'}</div>
				<div>Grid Item: Yes</div>
				<div>Draggable: Yes</div>
				<div>Resizable: No</div>
			</div>
		</div>
	</div>
{/if}
