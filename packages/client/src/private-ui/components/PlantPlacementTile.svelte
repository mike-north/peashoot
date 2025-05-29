<script lang="ts">
import type { ExistingGardenItem } from '../state/gardenDragState'

// import type { PlantPlacement } from '../../lib/plant-placement' // Old type

interface Props {
	plantPlacement: ExistingGardenItem // Changed to ExistingGardenItem
	xPos?: number // SVG x position (renamed from x to avoid conflict with ExistingGardenItem.x)
	yPos?: number // SVG y position (renamed from y to avoid conflict with ExistingGardenItem.y)
	sizePx?: number // SVG width (cellWidth * size)
	isSourceOfPendingMoveOrClone?: boolean // New prop
	showSizeBadge?: boolean // Only show size badge if true
}
// Use destructured props, providing defaults
let {
	plantPlacement,
	xPos = 0,
	yPos = 0,
	sizePx = 40,
	isSourceOfPendingMoveOrClone = false,
	showSizeBadge = false,
}: Props = $props()

// Access the core plant data via itemData
const corePlantData = $derived(plantPlacement.itemData)

// Use size from the core itemData using plantingDistanceInFeet
const itemSize = $derived(plantPlacement.size ?? corePlantData.plantingDistanceInFeet)
const iconDisplaySize = $derived(sizePx * 0.9)
const iconX = $derived(xPos + sizePx / 2)
const iconY = $derived(yPos + sizePx / 2)

function colorHashToCss(color: { r: number; g: number; b: number; a?: number }): string {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 0.4})`
}
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
	position: relative;
	&.is-pending-source {
		animation: pulse-opacity 1.5s infinite;
	}

	&__icon {
		opacity: 0.8;
	}
	&__name {
		fill-opacity: 0.7;
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

<div style="position: relative; width: 100%; height: 100%;">
	<svg
		width="100%"
		height="100%"
		viewBox={`0 0 ${sizePx} ${sizePx}`}
		class="plant-tile"
		data-plant-family={corePlantData.family}
		data-plant-color-variant={corePlantData.variant}
		class:is-pending-source={isSourceOfPendingMoveOrClone}
	>
		<!-- Tile background -->
		<rect
			x={xPos}
			y={yPos}
			width={sizePx}
			height={sizePx}
			class="plant-tile__background"
			style={`fill: ${colorHashToCss(corePlantData.presentation.accentColor)}`}
		/>
		<!-- Plant icon -->
		{#if corePlantData}
			<image
				href={`plant-icons/${corePlantData.presentation.tileIconPath}`}
				x={iconX - iconDisplaySize / 2}
				y={iconY - iconDisplaySize / 2}
				width={iconDisplaySize}
				height={iconDisplaySize}
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
				fill="white"
			>
				{corePlantData.displayName}
			</text>
		{/if}
	</svg>
	{#if showSizeBadge && itemSize > 1}
		<div class="plant-tile__size-badge">{itemSize}×{itemSize}</div>
	{/if}
</div>
