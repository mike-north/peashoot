<script lang="ts">
import TooltipArrow from './TooltipArrow.svelte'

interface Props {
	displayName: string
	family: string
	variant: string
	plantingDistanceInFeet: number
	tileIconPath: string
	direction?: 'above' | 'below'
	color?: string
	borderWidth?: number
	pointerOverlap?: number
}

let {
	displayName,
	family,
	variant,
	plantingDistanceInFeet,
	tileIconPath,
	direction = 'above',
	color = '#e5e7eb',
	borderWidth = 4,
	pointerOverlap = -4,
}: Props = $props()
</script>

<div class="relative tooltip-content" style="transition: opacity 100ms;">
	<div
		class="rounded-xl shadow-2xl bg-white border px-6 py-4 flex flex-col items-center gap-2 text-gray-900 text-center"
		style="border-width: {borderWidth}px; border-color: {color}; border-radius: {direction ===
		'above'
			? '20px 20px 8px 8px'
			: '8px 8px 20px 20px'}; background: white;"
	>
		<img
			src={`plant-icons/${tileIconPath}`}
			alt={displayName}
			class="w-20 h-20 object-contain mb-2"
		/>
		<div class="font-bold text-lg">{displayName}</div>
		<div class="text-sm text-gray-500">
			Family: <span class="font-medium text-gray-700">{family}</span>
		</div>
		<div class="text-sm text-gray-500">
			Variant: <span class="font-medium text-gray-700">{variant}</span>
		</div>
		<div class="text-sm text-gray-500">
			Planting Distance: <span class="font-medium text-gray-700"
				>{plantingDistanceInFeet} ft</span
			>
		</div>
	</div>
	<TooltipArrow
		direction={direction}
		color={color}
		borderWidth={borderWidth}
		pointerOverlap={pointerOverlap}
	/>
</div>
