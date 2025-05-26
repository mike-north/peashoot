<script lang="ts">
	import type { PlantPlacement } from '../../lib/plant-placement'

	export let plantPlacement: PlantPlacement
	export let x = 0 // SVG x position
	export let y = 0 // SVG y position
	export let sizePx = 40 // SVG width (cellWidth * size)

	// Color mapping for different plants
	const getPlantColor = (plantName: string) => {
		return `plant-tile ${plantName.toLowerCase()}`
	}

	const colorClass = getPlantColor(plantPlacement.plantTile.name)
	const size = plantPlacement.plantTile.size || 1
	const iconSize = sizePx * 0.3
	const iconX = x + sizePx / 2
	const iconY = y + sizePx / 2
</script>

<svg width="100%" height="100%" viewBox={`0 0 ${sizePx} ${sizePx}`} class={colorClass}>
	<!-- Tile background -->
	<rect {x} {y} width={sizePx} height={sizePx} class="plant-placement-tile__background" />
	<!-- Plant icon -->
	<circle
		cx={iconX}
		cy={iconY}
		r={iconSize / 2}
		class="plant-placement-tile__icon"
		opacity="0.8"
	/>
	<!-- Plant name text -->
	<text
		x={iconX}
		y={iconY + sizePx / 4}
		text-anchor="middle"
		class="plant-placement-tile__name"
		font-size={Math.max(8, sizePx / 6)}
	>
		{plantPlacement.plantTile.name}
	</text>
	<!-- Size indicator for multi-cell plants -->
	{#if size > 1}
		<text
			x={iconX}
			y={iconY - sizePx / 4}
			text-anchor="middle"
			class="plant-placement-tile__size-indicator"
			font-size={Math.max(6, sizePx / 8)}
		>
			{size}×{size}
		</text>
	{/if}
</svg>

<style lang="scss">
	.plant-tile {
		&__icon {
			opacity: 0.8;
		}
		&__name {
			// font-family: Arial, sans-serif;
			// fill: #4b4e6d;
			color: white;
			// opacity: 0.7;
		}
		&__size-indicator {
			font-family: Arial, sans-serif;
			fill: #4b4e6d;
			opacity: 0.5;
		}
		&__border {
			stroke: #222;
			stroke-width: 1;
			fill: none;
		}
		.plant-placement-tile__background {
			fill-opacity: 0.3;
		}
		.plant-placement-tile__size-indicator,
		.plant-placement-tile__name {
			fill-opacity: 0.7	;
		}
		&.tomato {
			.plant-placement-tile__background {
				fill: var(--color-tomato-red);
				fill-opacity: 0.3;
			}
		}
		&.lettuce {
			.plant-placement-tile__background {
				fill: var(--color-lettuce-green);
				fill-opacity: 0.3;
			}
		}
		&.cherry {
			.plant-placement-tile__background {
				fill: var(--color-cherry-red);
				fill-opacity: 0.6;
			}
			.plant-placement-tile__name {
				fill: white;
			}
		}
		&.carrot {
			.plant-placement-tile__background {
				fill: var(--color-carrot-orange);
				fill-opacity: 0.3;
			}
		}
		&.spinach {
			.plant-placement-tile__background {
				fill: var(--color-spinach-green);
				fill-opacity: 0.3;
			}
		}
		&.cucumber {
			.plant-placement-tile__background {
				fill: var(--color-cucumber-green);
				fill-opacity: 0.3;
			}
		}
		&.pepper {
			.plant-placement-tile__background {
				fill: var(--color-yellow-pepper);
				fill-opacity: 0.3;
			}
		}
		&.yellow-pepper {
			.plant-placement-tile__background {
				fill: var(--color-yellow-pepper);
				fill-opacity: 0.3;
			}
		}
	}
</style>
