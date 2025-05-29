<script lang="ts">
import PlantPlacementTile from './PlantPlacementTile.svelte'
import type { GardenPendingOperation } from '../state/gardenDragState'
import { getPlantSize } from '../state/gardenDragState'
import type { Plant } from '../../private-lib/plant'

interface Props {
	operation: GardenPendingOperation
	sizePx: number
}

let { operation, sizePx }: Props = $props()

// Create a temporary ExistingGardenItem for display
const itemForDisplay = $derived({
	id: `pending-${operation.id}`,
	x: operation.x || 0,
	y: operation.y || 0,
	itemData: operation.item,
	size: getPlantSize(operation.item),
})

let showAsCircle = $state(false)
</script>

<style lang="scss">
.pending-tile {
	border: 2px dashed rgba(0, 0, 0, 0.4);
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;

	&--success {
		border-color: rgba(0, 255, 0, 0.6);
		box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
	}

	&--error {
		border-color: rgba(255, 0, 0, 0.6);
		box-shadow: 0 0 8px rgba(255, 0, 0, 0.3);
	}

	&--pending {
		border-color: rgba(255, 165, 0, 0.6);
		box-shadow: 0 0 8px rgba(255, 165, 0, 0.3);
		animation: pulse 1.5s infinite;
	}

	&__icon {
		font-size: 24px;
		opacity: 0.7;
	}

	&__placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-weight: bold;
		font-size: 18px;
		color: #fff;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
	}

	&__status-overlay {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: bold;
		color: white;
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);

		&--success {
			background: rgba(0, 200, 0, 0.9);
		}

		&--error {
			background: rgba(200, 0, 0, 0.9);
		}

		&--pending {
			background: rgba(255, 165, 0, 0.9);
		}
	}
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}
</style>

<div
	class="pending-tile pending-tile--{operation.state}"
	style="width: {sizePx}px; height: {sizePx}px;"
>
	{#if showAsCircle}
		{@const plant = operation.item}
		<div
			class="pending-tile__placeholder"
			style="background: {plant.presentation.accentColor};"
		>
			{plant.family.charAt(0).toUpperCase()}
		</div>
	{:else if itemForDisplay}
		<PlantPlacementTile plantPlacement={itemForDisplay} sizePx={sizePx} />
	{/if}

	<!-- Status indicator -->
	<div
		class="pending-tile__status-overlay pending-tile__status-overlay--{operation.state}"
	>
		{#if operation.state === 'success'}
			✓
		{:else if operation.state === 'error'}
			✗
		{:else}
			?
		{/if}
	</div>
</div>
