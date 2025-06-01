<script lang="ts">
import { dragState, isDraggingExistingItem, pendingOperations } from '../../dnd/state'
import PendingOperationTile from './PendingOperationTile.svelte'
import { isGardenItemRemovalOperation } from '../../../private-ui/state/gardenDragState'
import { deleteZoneDragEvents } from '../actions/deleteZoneDragEvents'
import TrashIcon from '~icons/ph/trash-duotone'

// Show delete zone only when dragging an existing plant
let showDeleteZone = $derived(isDraggingExistingItem($dragState))

// Get pending removal operations
let pendingRemovals = $derived($pendingOperations.filter(isGardenItemRemovalOperation))

// Track if mouse is over delete zone
let isHovered = $state(false)

// Callback for the action to update isHovered
function setIsHovered(hovered: boolean) {
	isHovered = hovered
}
</script>

<style lang="scss">
.delete-zone {
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 120px;
	height: 120px;
	background: linear-gradient(135deg, #ff6b6b, #ee5a52);
	border: 3px dashed #fff;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: bold;
	font-size: 0.9rem;
	text-align: center;
	box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
	transition: all 0.3s ease;
	z-index: 1000;
	cursor: pointer;
	user-select: none;

	&--hidden {
		opacity: 0;
		transform: scale(0.8) translateY(20px);
		pointer-events: none;
	}

	&--hovered {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
		border-color: #ffeb3b;
		background: linear-gradient(135deg, #ff5252, #d32f2f);
	}

	&__icon {
		font-size: 2rem;
		margin-bottom: 4px;
		animation: pulse 2s infinite;
	}

	&__text {
		font-size: 0.75rem;
		line-height: 1.2;
	}
}

@keyframes pulse {
	0%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

.delete-zone--hovered .delete-zone__icon {
	animation: shake 0.5s infinite;
}

@keyframes shake {
	0%,
	100% {
		transform: translateX(0);
	}
	25% {
		transform: translateX(-2px);
	}
	75% {
		transform: translateX(2px);
	}
}

.pending-removal {
	position: absolute;
	width: 60px;
	height: 60px;
	z-index: 999;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>

<div
	class="delete-zone"
	class:delete-zone--hidden={!showDeleteZone}
	class:delete-zone--hovered={isHovered && showDeleteZone}
	role="button"
	tabindex="0"
	use:deleteZoneDragEvents={{
		dragStateStore: dragState,
		setIsHovered: setIsHovered,
	}}
>
	<div class="delete-zone__icon">
		<TrashIcon class="delete-zone__icon-trash" />
	</div>
	<div class="delete-zone__text">Drop to Delete</div>
</div>

<!-- Pending Removal Indicators -->
{#each pendingRemovals as removal, index (removal.id)}
	<div
		class="pending-removal"
		style="
			right: {20 + (index % 3) * 70}px;
			bottom: {160 + Math.floor(index / 3) * 70}px;
		"
	>
		<PendingOperationTile operation={removal} sizePx={60} />
	</div>
{/each}
