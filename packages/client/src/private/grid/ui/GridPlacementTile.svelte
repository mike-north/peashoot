<script lang="ts" generics="T extends GridPlaceable">
import type { GridPlaceable, GridPlacement } from '../grid-placement'
import { rgbToCss } from '@peashoot/types'
import { tooltip } from '../../../lib/tooltips/action'

export interface GridPlacementTileProps<T extends GridPlaceable> {
	placement: GridPlacement<T>
	sizePx: number // SVG width (cellWidth * size)
	isPulsingSource?: boolean // Visual indicator for pending operations
	showSizeBadge?: boolean // Only show size badge if true
	disableTooltip?: boolean // Disable tooltip entirely
}

let {
	placement,
	sizePx = 40,
	isPulsingSource = false,
	showSizeBadge = false,
	disableTooltip = false,
}: GridPlacementTileProps<T> = $props()

const item = $derived(placement.item)
const itemSize = $derived(placement.size)
const iconDisplaySize = $derived(sizePx * 0.9)

// Tile element reference
let tileElement: HTMLDivElement | null = $state(null)
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

.grid-placement-tile {
	position: relative;
	&.is-pulsing {
		animation: pulse-opacity 1.5s infinite;
	}

	&__icon {
		opacity: 0.8;
	}
	&__size-badge {
		position: absolute;
		top: 2px;
		right: 2px;
		font-size: 8px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 1px 3px;
		border-radius: 2px;
		z-index: 10;
		pointer-events: none;
	}
	&__background {
		fill-opacity: 0.6;
	}
}
</style>

<div
	bind:this={tileElement}
	aria-label={item.displayName}
	style="position: relative; width: 100%; height: 100%;"
	data-placement-id={placement.id}
	use:tooltip={!disableTooltip ? { item } : undefined}
>
	<svg
		width="100%"
		height="100%"
		viewBox={`0 0 ${sizePx} ${sizePx}`}
		class="grid-placement-tile"
		class:is-pulsing={isPulsingSource}
		data-item-id={item.id}
		data-placement-id={placement.id}
	>
		<rect
			x="0"
			y="0"
			width={sizePx}
			height={sizePx}
			class="grid-placement-tile__background"
			style={`fill: ${rgbToCss({
				...item.presentation.accentColor,
				alpha: 0.6 * (item.presentation.accentColor.alpha ?? 1),
			})}`}
		/>

		{#if item.presentation.iconPath}
			<image
				href={'/plant-icons/' + item.presentation.iconPath}
				x={(sizePx - iconDisplaySize) / 2}
				y={(sizePx - iconDisplaySize) / 2}
				width={iconDisplaySize}
				height={iconDisplaySize}
				class="grid-placement-tile__icon"
				opacity="0.8"
			/>
		{/if}
	</svg>
	{#if showSizeBadge && itemSize > 1}
		<div class="grid-placement-tile__size-badge">{itemSize}×{itemSize}</div>
	{/if}
</div>

<!-- Window resize handler -->
<svelte:window onresize={null} />
