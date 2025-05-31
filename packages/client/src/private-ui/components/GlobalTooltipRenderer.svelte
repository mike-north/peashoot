<script lang="ts">
import { tooltip } from '../state/tooltipStore'
import { mount, unmount } from 'svelte'
import TooltipWrapper from './TooltipWrapper.svelte'
import type { GridPlaceable } from '../../private-lib/grid-placement'
import { onMount } from 'svelte'
import type { Component } from 'svelte'

let portalContainer: HTMLElement | null = null
let mountedTooltip: ReturnType<typeof mount> | null = null
let isCleaningUp = false // Flag to prevent double cleanup
let currentTooltipId: string | null = null // Track current tooltip ID

// Create portal container on mount
function createPortalContainer() {
	if (portalContainer) return

	portalContainer = document.createElement('div')
	portalContainer.id = 'global-tooltip-portal'
	portalContainer.style.position = 'fixed'
	portalContainer.style.top = '0'
	portalContainer.style.left = '0'
	portalContainer.style.width = '100%'
	portalContainer.style.height = '100%'
	portalContainer.style.pointerEvents = 'none'
	portalContainer.style.zIndex = '10000'
	document.body.appendChild(portalContainer)
}

// Clean up portal container
function cleanupPortalContainer() {
	if (portalContainer && document.body.contains(portalContainer)) {
		document.body.removeChild(portalContainer)
		portalContainer = null
	}
}

// Cleanup mounted tooltip
async function cleanupTooltip() {
	// Prevent double cleanup
	if (!mountedTooltip || isCleaningUp) return

	isCleaningUp = true
	currentTooltipId = null

	try {
		await unmount(mountedTooltip)
	} catch (error: unknown) {
		console.error('Error unmounting tooltip:', error)
	} finally {
		mountedTooltip = null
		isCleaningUp = false
	}
}

// Mount new tooltip immediately
function mountTooltip(state: {
	id: string
	position: { x: number; y: number; orientation: 'top' | 'bottom' | 'left' | 'right' }
	item: GridPlaceable
	TooltipComponent: Component<{ item: GridPlaceable }>
	tileCenterX: number
	tileCenterY: number
}) {
	// Ensure portal container exists
	createPortalContainer()

	if (!portalContainer || isCleaningUp) return

	try {
		// Mount the new tooltip immediately
		mountedTooltip = mount(TooltipWrapper<GridPlaceable>, {
			target: portalContainer,
			props: {
				x: state.position.x,
				y: state.position.y,
				orientation: state.position.orientation,
				TooltipComponent: state.TooltipComponent,
				item: state.item,
				tileCenterX: state.tileCenterX,
				tileCenterY: state.tileCenterY,
			},
		})
		currentTooltipId = state.id
	} catch (error: unknown) {
		console.error('Error mounting tooltip:', error)
		mountedTooltip = null
		currentTooltipId = null
	}
}

// Handle tooltip state changes
function handleTooltipStateChange(state: {
	id: string | null
	isVisible: boolean
	position: { x: number; y: number; orientation: 'top' | 'bottom' | 'left' | 'right' }
	item: GridPlaceable | null
	TooltipComponent: Component<{ item: GridPlaceable }> | null
	tileCenterX: number
	tileCenterY: number
}) {
	if (state.isVisible && state.TooltipComponent && state.item && state.id) {
		// If it's the same tooltip, don't remount
		if (currentTooltipId === state.id) return

		// Clean up existing tooltip in background if needed
		if (mountedTooltip && currentTooltipId !== state.id) {
			void cleanupTooltip()
		}

		// Mount new tooltip immediately
		mountTooltip({
			id: state.id,
			position: state.position,
			item: state.item,
			TooltipComponent: state.TooltipComponent,
			tileCenterX: state.tileCenterX,
			tileCenterY: state.tileCenterY,
		})
	} else {
		// Clean up mounted tooltip when hiding
		if (mountedTooltip) {
			void cleanupTooltip()
		}
	}
}

onMount(() => {
	createPortalContainer()

	const unsubscribe = tooltip.subscribe((state) => {
		// Handle state changes immediately
		handleTooltipStateChange(state)
	})

	// Cleanup on component destroy
	return () => {
		unsubscribe()
		// Cleanup without awaiting to avoid blocking destruction
		if (mountedTooltip && !isCleaningUp) {
			void cleanupTooltip()
		}
		cleanupPortalContainer()
	}
})
</script>

<!-- This component doesn't render anything itself - it only manages the portal -->
