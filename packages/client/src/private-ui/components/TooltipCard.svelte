<script lang="ts" generics="TItem extends DraggableItem">
import { type DraggableItem, type DraggableItemTooltipProps } from '../state/dragState'
import TooltipArrow from './TooltipArrow.svelte'
import { colorHashToCss } from '../../lib/value-objects/color'

let {
	placement,
	direction = 'above',
	borderWidth = 4,
	pointerOverlap = -4,
	TooltipContentsComponent,
}: DraggableItemTooltipProps<TItem> = $props()

const color = $derived(colorHashToCss(placement.itemData.presentation.bgColor))
</script>

<div class="relative tooltip-content" style="transition: opacity 100ms;">
	<div
		class="rounded-xl shadow-2xl bg-white border px-6 py-4 flex flex-col items-center gap-2 text-gray-900 text-center"
		style="border-width: {borderWidth}px; border-color: {color}; border-radius: {direction ===
		'above'
			? '20px 20px 8px 8px'
			: '8px 8px 20px 20px'}; background: white;"
	>
		<TooltipContentsComponent item={placement.itemData} />
	</div>
	<TooltipArrow
		direction={direction}
		color={color}
		borderWidth={borderWidth}
		pointerOverlap={pointerOverlap}
	/>
</div>
