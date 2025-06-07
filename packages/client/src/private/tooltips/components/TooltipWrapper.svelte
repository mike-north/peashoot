<script lang="ts" generics="T extends GridPlaceable">
import type { Component } from 'svelte'
import { mount } from 'svelte'
import type { GridPlaceable } from '../../grid/grid-placement'

export interface TooltipWrapperProps<T extends GridPlaceable> {
	x: number
	y: number
	orientation: 'top' | 'bottom' | 'left' | 'right'
	item: T
	TooltipComponent: Component<{ item: T }>
	tileCenterX: number // X position of the tile edge center relative to viewport
	tileCenterY: number // Y position of the tile edge center relative to viewport
}

let {
	item,
	x = 0,
	y = 0,
	orientation = 'top',
	TooltipComponent,
	tileCenterX,
	tileCenterY,
}: TooltipWrapperProps<T> = $props()

const accentColor = `rgba(${item.presentation.accentColor.red}, ${item.presentation.accentColor.green}, ${item.presentation.accentColor.blue}, ${item.presentation.accentColor.alpha ?? 0.4})`
let contentContainer: HTMLDivElement | null = $state(null)
let isVisible = $state(true)

// Calculate arrow position relative to tile edge center
// Subtract half the arrow width (8px) to center the arrow properly
const arrowOffsetX = $derived(tileCenterX - x - 8)
const arrowOffsetY = $derived(tileCenterY - y - 8)

// Expose a method to trigger fade out
export function fadeOut(): Promise<void> {
	return new Promise((resolve) => {
		isVisible = false
		// Wait for fade-out animation to complete
		setTimeout(resolve, 100)
	})
}

// Mount the content component when container becomes available
$effect(() => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (contentContainer) {
		mount(TooltipComponent, {
			target: contentContainer,
			props: { item },
		})
	}
})
</script>

<style lang="scss">
@keyframes tooltip-fade-in {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes tooltip-fade-out {
	from {
		opacity: 1;
		transform: scale(1);
	}
	to {
		opacity: 0;
		transform: scale(0.95);
	}
}

.tooltip {
	position: absolute;
	pointer-events: none;
	min-width: 400px;
	max-width: 600px;
	background: white;
	border: 4px solid var(--accent-color);
	border-radius: 8px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	z-index: 10001;
	animation: tooltip-fade-in 0.2s ease-out;

	&--fading-out {
		animation: tooltip-fade-out 0.1s ease-out;
	}
}

.tooltip__content {
	padding: 1rem;
}

.tooltip__arrow {
	position: absolute;
	width: 0;
	height: 0;
	border: 8px solid transparent;

	&--top {
		bottom: -16px;
		left: var(--arrow-offset-x);
		border-top-color: var(--accent-color);
	}

	&--bottom {
		top: -16px;
		left: var(--arrow-offset-x);
		border-bottom-color: var(--accent-color);
	}

	&--left {
		right: -16px;
		top: var(--arrow-offset-y);
		border-left-color: var(--accent-color);
	}

	&--right {
		left: -16px;
		top: var(--arrow-offset-y);
		border-right-color: var(--accent-color);
	}
}
</style>

<div
	class="tooltip"
	class:tooltip--fading-out={!isVisible}
	style={`left: ${x}px; top: ${y}px; --arrow-offset-x: ${arrowOffsetX}px; --arrow-offset-y: ${arrowOffsetY}px; --accent-color: ${accentColor};`}
>
	<div class="tooltip__arrow tooltip__arrow--{orientation}"></div>
	<div class="tooltip__content" bind:this={contentContainer}></div>
</div>
