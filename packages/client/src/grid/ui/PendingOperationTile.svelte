<script lang="ts" generics="T extends WithVisualPresentation">
import GridPlacementTile from './GridPlacementTile.svelte'
import type { GridPlacement, WithVisualPresentation } from '../grid-placement'
import type { GardenPendingOperation } from '../../private-ui/state/gardenDragState'
import {
	OPERATION_PROGRESS_ANIMATION_DELAY_MS,
	OPERATION_COMPLETION_DISPLAY_DURATION_MS,
} from '../../dnd/constants'
import CheckIcon from '~icons/ph/check-bold'
import XIcon from '~icons/ph/x-bold'
import TrashIcon from '~icons/ph/trash-duotone'

interface Props<T extends WithVisualPresentation> {
	operation: GardenPendingOperation<T>
	sizePx: number
}

let { operation, sizePx }: Props<T> = $props()

// Create a GridPlacement for display
const placementForDisplay = $derived(
	(() => {
		if (!operation.zoneId) {
			throw new Error(`PendingOperation ${operation.id} is missing required zoneId`)
		}
		const displayItem = operation.item

		return {
			id: `pending-${operation.id}`,
			x: operation.x || 0,
			y: operation.y || 0,
			size: operation.item.presentation.size,
			item: displayItem,
			sourceZoneId: operation.zoneId,
		} satisfies GridPlacement<WithVisualPresentation>
	})(),
)

// Check if this is a removal operation
const isRemoval = $derived(operation.type === 'removal')

// Track if we should show the progress animation
let showProgressAnimation = $state(false)
let progressAnimationTimer: number | undefined = $state()

// Track if we should show completion state
let showCompletionState = $state(false)
let completionTimer: number | undefined = $state()

// Watch for state changes
$effect(() => {
	if (operation.state === 'pending') {
		// Start timer to show progress animation
		progressAnimationTimer = window.setTimeout(() => {
			showProgressAnimation = true
		}, OPERATION_PROGRESS_ANIMATION_DELAY_MS)
	} else {
		// Clear progress timer and hide progress animation
		if (progressAnimationTimer) {
			clearTimeout(progressAnimationTimer)
			progressAnimationTimer = undefined
		}
		showProgressAnimation = false

		// Show completion state
		showCompletionState = true
		completionTimer = window.setTimeout(() => {
			showCompletionState = false
		}, OPERATION_COMPLETION_DISPLAY_DURATION_MS)
	}

	// Cleanup on unmount or state change
	return () => {
		if (progressAnimationTimer) {
			clearTimeout(progressAnimationTimer)
		}
		if (completionTimer) {
			clearTimeout(completionTimer)
		}
	}
})
</script>

<style lang="scss">
.pending-tile {
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-sizing: border-box;
	transition: all 0.3s ease;
	overflow: hidden;

	&--pending {
		border: 2px dashed rgba(0, 0, 0, 0.4);

		&.show-progress {
			border: none;

			&:not(.is-removal)::before {
				content: '';
				position: absolute;
				top: -2px;
				left: -2px;
				right: -2px;
				bottom: -2px;
				border-radius: 8px;
				background: linear-gradient(
					90deg,
					transparent 0%,
					transparent 25%,
					#ff6b00 30%,
					#ffaa00 40%,
					#ffdd00 50%,
					#ffaa00 60%,
					#ff6b00 70%,
					transparent 75%,
					transparent 100%
				);
				background-size: 300% 100%;
				animation: chasingBorder 2s linear infinite;
				z-index: 1;
				filter: blur(1px);
			}

			&.is-removal::before {
				content: '';
				position: absolute;
				top: -2px;
				left: -2px;
				right: -2px;
				bottom: -2px;
				border-radius: 8px;
				background: linear-gradient(
					90deg,
					transparent 0%,
					transparent 25%,
					#8b0000 30%,
					#dc143c 40%,
					#ff1744 50%,
					#dc143c 60%,
					#8b0000 70%,
					transparent 75%,
					transparent 100%
				);
				background-size: 300% 100%;
				animation: chasingBorder 2s linear infinite;
				z-index: 1;
				filter: blur(1px);
			}

			&::after {
				content: '';
				position: absolute;
				top: 3px;
				left: 3px;
				right: 3px;
				bottom: 3px;
				border-radius: 4px;
				background: rgba(255, 255, 255, 0.95);
				z-index: 2;
			}

			// Add an additional glow layer for non-removal
			&:not(.is-removal) .pending-tile__content::before {
				content: '';
				position: absolute;
				top: -4px;
				left: -4px;
				right: -4px;
				bottom: -4px;
				border-radius: 10px;
				background: linear-gradient(
					90deg,
					transparent 0%,
					transparent 25%,
					rgba(255, 140, 0, 0.6) 30%,
					rgba(255, 200, 0, 0.8) 50%,
					rgba(255, 140, 0, 0.6) 70%,
					transparent 75%,
					transparent 100%
				);
				background-size: 300% 100%;
				animation: chasingBorder 2s linear infinite;
				z-index: 0;
				filter: blur(8px);
			}

			// Add glow layer for removal
			&.is-removal .pending-tile__content::before {
				content: '';
				position: absolute;
				top: -4px;
				left: -4px;
				right: -4px;
				bottom: -4px;
				border-radius: 10px;
				background: linear-gradient(
					90deg,
					transparent 0%,
					transparent 25%,
					rgba(139, 0, 0, 0.6) 30%,
					rgba(255, 23, 68, 0.8) 50%,
					rgba(139, 0, 0, 0.6) 70%,
					transparent 75%,
					transparent 100%
				);
				background-size: 300% 100%;
				animation: chasingBorder 2s linear infinite;
				z-index: 0;
				filter: blur(8px);
			}
		}
	}

	&--success {
		&.show-completion:not(.is-removal) {
			background: #4caf50;
			border: 2px solid #45a049;
			animation: successPulse 0.3s ease-out;
		}

		&.show-completion.is-removal {
			background: #9c27b0;
			border: 2px solid #7b1fa2;
			animation: removalPulse 0.3s ease-out;
		}
	}

	&--error {
		&.show-completion {
			background: #f44336;
			border: 2px solid #da190b;
			animation: errorShake 0.3s ease-out;
		}
	}

	&__content {
		position: relative;
		z-index: 3;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__completion-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
		color: white;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		animation: iconPop 0.3s ease-out;

		&--large {
			font-size: 48px;
		}
	}
}

@keyframes chasingBorder {
	0% {
		background-position: -150% 0;
	}
	100% {
		background-position: 150% 0;
	}
}

@keyframes successPulse {
	0% {
		transform: scale(1);
		opacity: 0.7;
	}
	50% {
		transform: scale(1.05);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes errorShake {
	0%,
	100% {
		transform: translateX(0);
	}
	10%,
	30%,
	50%,
	70%,
	90% {
		transform: translateX(-2px);
	}
	20%,
	40%,
	60%,
	80% {
		transform: translateX(2px);
	}
}

@keyframes iconPop {
	0% {
		transform: translate(-50%, -50%) scale(0);
		opacity: 0;
	}
	50% {
		transform: translate(-50%, -50%) scale(1.2);
		opacity: 1;
	}
	100% {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
	}
}

@keyframes removalPulse {
	0% {
		transform: scale(1);
		opacity: 0.7;
	}
	50% {
		transform: scale(0.95);
		opacity: 1;
	}
	100% {
		transform: scale(0.9);
		opacity: 0;
	}
}
</style>

<div
	class="pending-tile pending-tile--{operation.state}"
	class:show-progress={showProgressAnimation && operation.state === 'pending'}
	class:show-completion={showCompletionState &&
		(operation.state === 'success' || operation.state === 'error')}
	class:is-removal={isRemoval}
	style="width: {sizePx}px; height: {sizePx}px;"
>
	<div class="pending-tile__content">
		{#if !showCompletionState && placementForDisplay}
			<GridPlacementTile placement={placementForDisplay} sizePx={sizePx} />
		{/if}

		{#if showCompletionState}
			{#if operation.state === 'success'}
				{#if isRemoval}
					<TrashIcon
						style="color: white"
						class="pending-tile__completion-icon pending-tile__completion-icon--large"
					/>
				{:else}
					<CheckIcon
						class="pending-tile__completion-icon pending-tile__completion-icon--large"
					/>
				{/if}
			{:else if operation.state === 'error'}
				<XIcon
					class="pending-tile__completion-icon pending-tile__completion-icon--large"
				/>
			{/if}
		{/if}
	</div>
</div>
