<script lang="ts">
import type { ExistingGardenItem } from '../state/gardenDragState'

// import type { PlantPlacement } from '../../lib/plant-placement' // Old type

interface Props {
	plantPlacement: ExistingGardenItem // Changed to ExistingGardenItem
	xPos?: number // SVG x position (renamed from x to avoid conflict with ExistingGardenItem.x)
	yPos?: number // SVG y position (renamed from y to avoid conflict with ExistingGardenItem.y)
	sizePx?: number // SVG width (cellWidth * size)
	isSourceOfPendingMoveOrClone?: boolean // New prop
}

// Use destructured props, providing defaults
let {
	plantPlacement,
	xPos = 0,
	yPos = 0,
	sizePx = 40,
	isSourceOfPendingMoveOrClone = false,
}: Props = $props()

// Access the core plant data via itemData
const corePlantData = $derived(plantPlacement.itemData)

// Generate CSS variable name from plant family and color variant
const getPlantColorVariable = (familyName: string, colorVariant: string): string => {
	return `--color-${familyName}-${colorVariant}`
}

// Compute the background color CSS variable (reactive)
const backgroundColorVar = $derived(
	getPlantColorVariable(
		corePlantData.plantFamily.name,
		corePlantData.plantFamily.colorVariant,
	),
)

// Determine if we need white text for dark backgrounds
const isDarkBackground = (colorVariant: string): boolean => {
	return ['dark', 'red', 'purple', 'brown'].includes(colorVariant)
}

// Use size from the core itemData, or the instance, or default
const itemSize = $derived(plantPlacement.size ?? corePlantData.size ?? 1)
const iconDisplaySize = $derived(sizePx * 0.3)
const iconX = $derived(xPos + sizePx / 2)
const iconY = $derived(yPos + sizePx / 2)
const textColor = $derived(
	isDarkBackground(corePlantData.plantFamily.colorVariant) ? 'white' : '#4b4e6d',
)
</script>

<style lang="scss">
@keyframes pulse-opacity {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.4;
	}
}

.plant-tile {
	&.is-pending-source {
		animation: pulse-opacity 1.5s infinite;
	}

	&__icon {
		opacity: 0.8;
	}
	&__name {
		fill-opacity: 0.7;
	}
	&__size-indicator {
		font-family: Arial, sans-serif;
		fill: #4b4e6d;
		opacity: 0.5;
		fill-opacity: 0.7;
	}
	&__background {
		fill-opacity: 0.3;
	}
}
</style>

<svg
	width="100%"
	height="100%"
	viewBox={`0 0 ${sizePx} ${sizePx}`}
	class="plant-tile"
	class:is-pending-source={isSourceOfPendingMoveOrClone}
>
	<!-- Tile background -->
	<rect
		x={xPos}
		y={yPos}
		width={sizePx}
		height={sizePx}
		class="plant-tile__background"
		style={`fill: var(${backgroundColorVar})`}
	/>
	<!-- Plant icon -->
	{#if corePlantData}
		<circle
			cx={iconX}
			cy={iconY}
			r={iconDisplaySize / 2}
			class="plant-tile__icon"
			opacity="0.8"
		/>
		<!-- Plant name text -->
		<text
			x={iconX}
			y={iconY + sizePx / 4}
			text-anchor="middle"
			class="plant-tile__name"
			font-size={Math.max(8, sizePx / 6)}
			fill={textColor}
		>
			{corePlantData.name}
		</text>
		<!-- Size indicator for multi-cell plants -->
		{#if itemSize > 1}
			<text
				x={iconX}
				y={iconY - sizePx / 4}
				text-anchor="middle"
				class="plant-tile__size-indicator"
				font-size={Math.max(6, sizePx / 8)}
			>
				{itemSize}×{itemSize}
			</text>
		{/if}
	{/if}
</svg>
