<script lang="ts" generics="T extends GridPlaceable">
import type { GridPlaceable, GridPlacement } from '../../private-lib/grid-placement'
import type { Component } from 'svelte'
import { onMount, mount, unmount } from 'svelte'
import TooltipWrapper from './TooltipWrapper.svelte'

interface Props {
	placement: GridPlacement<T>
	sizePx: number // SVG width (cellWidth * size)
	isPulsingSource?: boolean // Visual indicator for pending operations
	showSizeBadge?: boolean // Only show size badge if true
	TooltipComponent?: Component<{ item: T }> // Component to render tooltip content
	isInToolbar?: boolean // Whether this tile is in the toolbar (affects positioning)
	disableTooltip?: boolean // Disable tooltip entirely
}

let {
	placement,
	sizePx = 40,
	isPulsingSource = false,
	showSizeBadge = false,
	TooltipComponent,
	isInToolbar = false,
	disableTooltip = false,
}: Props = $props()

const itemData = $derived(placement.data)
const itemSize = $derived(placement.size)
const iconDisplaySize = $derived(sizePx * 0.9)

// Tooltip state
let showTooltip = $state(false)
let tileElement: HTMLDivElement | null = $state(null)
let mountedTooltip:
	| (ReturnType<typeof mount> & { fadeOut?: () => Promise<void> })
	| null = null
let tooltipPosition = $state<{
	x: number
	y: number
	orientation: 'top' | 'bottom' | 'left' | 'right'
}>({
	x: 0,
	y: 0,
	orientation: 'top',
})

// Portal container
let portalContainer: HTMLElement | null = null

onMount(() => {
	// Create portal container in document.body
	portalContainer = document.createElement('div')
	portalContainer.id = 'tooltip-portal-' + placement.id
	portalContainer.style.position = 'fixed'
	portalContainer.style.top = '0'
	portalContainer.style.left = '0'
	portalContainer.style.width = '100%'
	portalContainer.style.height = '100%'
	portalContainer.style.pointerEvents = 'none'
	portalContainer.style.zIndex = '10000'
	document.body.appendChild(portalContainer)

	return () => {
		if (portalContainer && document.body.contains(portalContainer)) {
			document.body.removeChild(portalContainer)
		}
	}
})

function colorHashToCss(color: { r: number; g: number; b: number; a?: number }): string {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 0.4})`
}

function calculateTooltipPosition() {
	if (!tileElement) return

	const tileRect = tileElement.getBoundingClientRect()
	const viewportWidth = window.innerWidth
	const viewportHeight = window.innerHeight

	// Constants for positioning - using conservative estimates
	const TOOLTIP_OFFSET_TOP = 24 // Offset for tooltips above tiles
	const TOOLTIP_OFFSET_BOTTOM = -4 // Minimal offset for tooltips below tiles
	const TOOLTIP_WIDTH = 400
	const TOOLTIP_HEIGHT = 365 // Reduced to better match actual content height seen in images

	// Calculate available space in each direction
	const spaceAbove = tileRect.top - TOOLTIP_OFFSET_TOP
	const spaceBelow = viewportHeight - tileRect.bottom - TOOLTIP_OFFSET_BOTTOM
	const spaceLeft = tileRect.left - TOOLTIP_OFFSET_TOP
	const spaceRight = viewportWidth - tileRect.right - TOOLTIP_OFFSET_TOP

	// Check if there are any open dropdowns in toolbar (affects available space)
	const openDropdown = isInToolbar
		? document.querySelector('.plant-toolbar__dropdown')
		: null
	const dropdownRect = openDropdown?.getBoundingClientRect()

	// Adjust space calculations if dropdown is open
	let adjustedSpaceBelow = spaceBelow
	if (dropdownRect && isInToolbar) {
		adjustedSpaceBelow = Math.min(
			spaceBelow,
			dropdownRect.top - tileRect.bottom - TOOLTIP_OFFSET_BOTTOM,
		)
	}

	// Simple orientation logic - prioritize top, then bottom, then sides
	let orientation: 'top' | 'bottom' | 'left' | 'right' = 'top'

	if (spaceAbove >= TOOLTIP_HEIGHT) {
		orientation = 'top'
	} else if (adjustedSpaceBelow >= TOOLTIP_HEIGHT) {
		orientation = 'bottom'
	} else if (spaceRight >= TOOLTIP_WIDTH) {
		orientation = 'right'
	} else if (spaceLeft >= TOOLTIP_WIDTH) {
		orientation = 'left'
	} else {
		// Use the direction with the most space
		const maxSpace = Math.max(spaceAbove, adjustedSpaceBelow, spaceLeft, spaceRight)
		if (maxSpace === spaceAbove) orientation = 'top'
		else if (maxSpace === adjustedSpaceBelow) orientation = 'bottom'
		else if (maxSpace === spaceRight) orientation = 'right'
		else orientation = 'left'
	}

	// Calculate position based on orientation
	let x = 0
	let y = 0

	const tileCenterX = tileRect.left + tileRect.width / 2
	const tileCenterY = tileRect.top + tileRect.height / 2

	switch (orientation) {
		case 'top': {
			x = tileCenterX - TOOLTIP_WIDTH / 2
			y = tileRect.top - TOOLTIP_HEIGHT - TOOLTIP_OFFSET_TOP
			// Ensure tooltip doesn't go off-screen horizontally while keeping arrow centered
			const minX = 8
			const maxX = viewportWidth - TOOLTIP_WIDTH - 8
			if (x < minX || x > maxX) {
				// Constrain tooltip position but keep arrow pointing to tile center
				x = Math.max(minX, Math.min(x, maxX))
			}
			break
		}
		case 'bottom': {
			x = tileCenterX - TOOLTIP_WIDTH / 2
			// Account for arrow height - position tooltip so arrow is visible above it
			y = tileRect.bottom + 16 + TOOLTIP_OFFSET_BOTTOM
			// Same horizontal constraint logic for bottom
			const minXBottom = 8
			const maxXBottom = viewportWidth - TOOLTIP_WIDTH - 8
			if (x < minXBottom || x > maxXBottom) {
				x = Math.max(minXBottom, Math.min(x, maxXBottom))
			}
			break
		}
		case 'left':
			x = tileRect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET_TOP
			y = tileCenterY - TOOLTIP_HEIGHT / 2
			break
		case 'right':
			x = tileRect.right + TOOLTIP_OFFSET_TOP
			y = tileCenterY - TOOLTIP_HEIGHT / 2
			break
	}

	// Final viewport constraints (more conservative for vertical positions)
	y = Math.max(8, Math.min(y, viewportHeight - TOOLTIP_HEIGHT - 8))

	tooltipPosition = { x, y, orientation }
}

function handleMouseEnter() {
	if (disableTooltip || !TooltipComponent) return
	// Calculate position first, then show tooltip
	calculateTooltipPosition()
	showTooltip = true
}

function handleMouseLeave() {
	showTooltip = false
}

// Recalculate position on window resize
function handleWindowResize() {
	if (showTooltip) {
		calculateTooltipPosition()
	}
}

// Render tooltip using proper Svelte component mounting
$effect(() => {
	if (portalContainer && TooltipComponent && showTooltip && !disableTooltip) {
		// Clean up any existing tooltip before mounting new one
		if (mountedTooltip) {
			try {
				// Trigger fade out and wait for animation
				mountedTooltip
					.fadeOut?.()
					.then(() => {
						if (mountedTooltip) {
							void unmount(mountedTooltip)
							mountedTooltip = null
						}
					})
					.catch(() => {
						// Fallback if fadeOut fails
						if (mountedTooltip)
							unmount(mountedTooltip)
								.catch((err: unknown) => {
									console.error('Error unmounting tooltip:', err)
								})
								.finally(() => {
									mountedTooltip = null
								})
					})
			} catch {
				// Ignore unmount errors - component may have already been unmounted
				mountedTooltip = null
			}
		}

		// Mount the TooltipWrapper component with current position
		try {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!tileElement) return

			const tileRect = (tileElement as HTMLDivElement).getBoundingClientRect()

			// Calculate the center of the appropriate edge based on orientation
			let edgeCenterX: number
			let edgeCenterY: number

			const tileCenterX = tileRect.left + tileRect.width / 2
			const tileCenterY = tileRect.top + tileRect.height / 2

			switch (tooltipPosition.orientation) {
				case 'top':
					// Point to center of top edge
					edgeCenterX = tileCenterX
					edgeCenterY = tileRect.top
					break
				case 'bottom':
					// Point to center of bottom edge
					edgeCenterX = tileCenterX
					edgeCenterY = tileRect.bottom
					break
				case 'left':
					// Point to center of left edge
					edgeCenterX = tileRect.left
					edgeCenterY = tileCenterY
					break
				case 'right':
					// Point to center of right edge
					edgeCenterX = tileRect.right
					edgeCenterY = tileCenterY
					break
			}

			mountedTooltip = mount(TooltipWrapper, {
				target: portalContainer,
				props: {
					x: tooltipPosition.x,
					y: tooltipPosition.y,
					orientation: tooltipPosition.orientation,
					TooltipComponent: TooltipComponent as Component<{ item: unknown }>,
					item: itemData,
					tileCenterX: edgeCenterX,
					tileCenterY: edgeCenterY,
				},
			})
		} catch (error) {
			console.error('Error mounting tooltip:', error)
			mountedTooltip = null
		}
	} else if (mountedTooltip) {
		// Clean up mounted tooltip with fade out
		try {
			mountedTooltip
				.fadeOut?.()
				.then(() => {
					if (mountedTooltip) {
						void unmount(mountedTooltip)
						mountedTooltip = null
					}
				})
				.catch(() => {
					// Fallback if fadeOut fails
					if (mountedTooltip) {
						void unmount(mountedTooltip)
						mountedTooltip = null
					}
				})
		} catch {
			// Ignore unmount errors - component may have already been unmounted
			mountedTooltip = null
		}
	}
})
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={tileElement}
	aria-label={itemData.displayName}
	style="position: relative; width: 100%; height: 100%;"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
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

<!-- Window resize handler -->
<svelte:window onresize={handleWindowResize} />
