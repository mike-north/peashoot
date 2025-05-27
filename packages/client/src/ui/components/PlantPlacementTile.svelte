<script lang="ts">
import type { PlantPlacement } from '../../lib/plant-placement'

interface Props {
	plantPlacement: PlantPlacement
	x?: number // SVG x position
	y?: number // SVG y position
	sizePx?: number // SVG width (cellWidth * size)
}

let { plantPlacement, x = 0, y = 0, sizePx = 40 }: Props = $props()

// Generate CSS variable name from plant family and color variant
const getPlantColorVariable = (familyName: string, colorVariant: string): string => {
	return `--color-${familyName}-${colorVariant}`
}

// Compute the background color CSS variable
const backgroundColorVar = getPlantColorVariable(
	plantPlacement.plantTile.plantFamily.name,
	plantPlacement.plantTile.plantFamily.colorVariant,
)

// Determine if we need white text for dark backgrounds
const isDarkBackground = (colorVariant: string): boolean => {
	return ['dark', 'red', 'purple', 'brown'].includes(colorVariant)
}

const size = plantPlacement.plantTile.size || 1
const iconSize = sizePx * 0.3
const iconX = x + sizePx / 2
const iconY = y + sizePx / 2
const textColor = isDarkBackground(plantPlacement.plantTile.plantFamily.colorVariant)
	? 'white'
	: '#4b4e6d'
</script>

<style lang="scss">
.plant-tile {
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
	&__border {
		stroke: #222;
		stroke-width: 1;
		fill: none;
	}
	&__background {
		fill-opacity: 0.3;
	}
}
</style>

<svg width="100%" height="100%" viewBox={`0 0 ${sizePx} ${sizePx}`} class="plant-tile">
	<!-- Tile background -->
	<rect
		x={x}
		y={y}
		width={sizePx}
		height={sizePx}
		class="plant-tile__background"
		style={`fill: var(${backgroundColorVar})`}
	/>
	<!-- Plant icon -->
	<circle cx={iconX} cy={iconY} r={iconSize / 2} class="plant-tile__icon" opacity="0.8" />
	<!-- Plant name text -->
	<text
		x={iconX}
		y={iconY + sizePx / 4}
		text-anchor="middle"
		class="plant-tile__name"
		font-size={Math.max(8, sizePx / 6)}
		fill={textColor}
	>
		{plantPlacement.plantTile.name}
	</text>
	<!-- Size indicator for multi-cell plants -->
	{#if size > 1}
		<text
			x={iconX}
			y={iconY - sizePx / 4}
			text-anchor="middle"
			class="plant-tile__size-indicator"
			font-size={Math.max(6, sizePx / 8)}
		>
			{size}×{size}
		</text>
	{/if}
</svg>
