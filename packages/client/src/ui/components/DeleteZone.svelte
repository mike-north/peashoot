<script lang="ts">
import { dragState, isDraggingExistingPlant } from '../state/dragState'

// Show delete zone only when dragging an existing plant
let showDeleteZone = $derived(isDraggingExistingPlant($dragState))

// Track if mouse is over delete zone
let isHovered = $state(false)

function handleMouseEnter() {
	isHovered = true
	if (isDraggingExistingPlant($dragState)) {
		console.log('[DeleteZone] Mouse entered delete zone, setting targetType to delete-zone')
		dragState.update((state) => ({
			...state,
			targetType: 'delete-zone',
			targetBedId: null,
			highlightedCell: null,
		}))
	}
}

function handleMouseLeave() {
	isHovered = false
	if (isDraggingExistingPlant($dragState)) {
		console.log('[DeleteZone] Mouse left delete zone, clearing targetType')
		dragState.update((state) => ({
			...state,
			targetType: null,
		}))
	}
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
</style>

<div
	class="delete-zone"
	class:delete-zone--hidden={!showDeleteZone}
	class:delete-zone--hovered={isHovered && showDeleteZone}
	role="button"
	tabindex="0"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="delete-zone__icon">🗑️</div>
	<div class="delete-zone__text">Drop to Delete</div>
</div>
