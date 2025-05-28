<script lang="ts">
import type { ExistingGardenItem, GardenPendingOperation } from '../state/gardenDragState'
import PlantPlacementTile from './PlantPlacementTile.svelte'

interface PendingOperationTileProps {
	operation: GardenPendingOperation
	sizePx: number
	circular?: boolean
}

let { operation, sizePx, circular = false }: PendingOperationTileProps = $props()

// Create a temporary ExistingGardenItem for rendering with PlantPlacementTile
const tempExistingItem: ExistingGardenItem = $derived({
	id: operation.id,
	x: operation.x ?? 0,
	y: operation.y ?? 0,
	itemData: operation.item,
	size: operation.item.size ?? 1,
})

const itemForDisplay = $derived(operation.item)
</script>

<style lang="scss">
.pending-tile {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: 6px;
	overflow: hidden;

	&--circular {
		border-radius: 50%;
	}

	&__circular-plant {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.8rem;
		border-radius: 50%;
	}

	&__overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		z-index: 10;
		font-size: 1.5rem;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	&--circular &__overlay {
		border-radius: 50%;
	}

	&__overlay--pending {
		background: rgba(255, 255, 255, 0.9);
		color: #6c757d;
	}

	&__overlay--success {
		background: rgba(40, 167, 69, 0.9);
		color: white;
	}

	&__overlay--error {
		background: rgba(220, 53, 69, 0.9);
		color: white;
	}

	&__spinner {
		width: 20px;
		height: 20px;
		border: 2px solid #f3f3f3;
		border-top: 2px solid #6c757d;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.fade-out {
	opacity: 0;
	transform: scale(0.9);
}
</style>

<div class="pending-tile" class:pending-tile--circular={circular}>
	<!-- Base plant tile (dimmed) -->
	<div style="opacity: 0.3;">
		{#if circular && itemForDisplay}
			<!-- For circular mode, show just the plant icon -->
			{@const plantFamilyName = itemForDisplay.plantFamily.name || 'lettuce'}
			{@const colorVariantName = itemForDisplay.plantFamily.colorVariant || 'green'}
			{@const colorVar = `--color-${plantFamilyName}-${colorVariantName}`}
			<div
				class="pending-tile__circular-plant"
				style="background-color: var({colorVar});"
			>
				{itemForDisplay.icon}
			</div>
		{:else if itemForDisplay}
			<PlantPlacementTile plantPlacement={tempExistingItem} sizePx={sizePx} />
		{/if}
	</div>

	<!-- Status overlay -->
	<div class="pending-tile__overlay pending-tile__overlay--{operation.state}">
		{#if operation.state === 'pending'}
			<div class="pending-tile__spinner"></div>
		{:else if operation.state === 'success'}
			✓
		{:else if operation.state === 'error'}
			✗
		{/if}
	</div>
</div>
