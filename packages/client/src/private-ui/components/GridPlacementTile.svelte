<script
	lang="ts"
	generics="T extends { id: string; displayName: string; presentation: { iconPath: string; accentColor: { r: number; g: number; b: number; a?: number } } }"
>
import type { GridPlacement } from '../../private-lib/grid-placement'

interface Props {
	placement: GridPlacement<T>
	sizePx: number // SVG width (cellWidth * size)
	isPulsingSource?: boolean // Visual indicator for pending operations
	showSizeBadge?: boolean // Only show size badge if true
}

let {
	placement,
	sizePx = 40,
	isPulsingSource = false,
	showSizeBadge = false,
}: Props = $props()

const itemData = $derived(placement.data)
const itemSize = $derived(placement.size)
const iconDisplaySize = $derived(sizePx * 0.9)

function colorHashToCss(color: { r: number; g: number; b: number; a?: number }): string {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 0.4})`
}

// All tooltip-related code has been removed.
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
	aria-label={itemData.displayName}
	style="position: relative; width: 100%; height: 100%;"
>
	<svg
		width="100%"
		height="100%"
		viewBox={`0 0 ${sizePx} ${sizePx}`}
		class="grid-placement-tile"
		class:is-pulsing={isPulsingSource}
		data-item-id={itemData.id}
		data-placement-id={placement.id}
	>
		<rect
			x="0"
			y="0"
			width={sizePx}
			height={sizePx}
			class="grid-placement-tile__background"
			style={`fill: ${colorHashToCss(itemData.presentation.accentColor)}`}
		/>
		{#if itemData.presentation.iconPath}
			<image
				href={'/plant-icons/' + itemData.presentation.iconPath}
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
