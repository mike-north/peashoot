import { writable } from 'svelte/store'
import type { Component } from 'svelte'
import type { GridPlaceable } from '../../private/grid/grid-placement'

export interface TooltipState {
	id: string | null
	isVisible: boolean
	position: {
		x: number
		y: number
		orientation: 'top' | 'bottom' | 'left' | 'right'
	}
	item: GridPlaceable | null
	TooltipComponent: Component<{ item: GridPlaceable }> | null
	tileCenterX: number
	tileCenterY: number
}

const initialState: TooltipState = {
	id: null,
	isVisible: false,
	position: {
		x: 0,
		y: 0,
		orientation: 'top',
	},
	item: null,
	TooltipComponent: null,
	tileCenterX: 0,
	tileCenterY: 0,
}

// Create the writable store
const tooltipState = writable<TooltipState>(initialState)

// Export the store
export const tooltip = tooltipState

// Helper functions to manage tooltip state
export function showTooltip<T extends GridPlaceable>(params: {
	id: string
	position: {
		x: number
		y: number
		orientation: 'top' | 'bottom' | 'left' | 'right'
	}
	item: T
	TooltipComponent: Component<{ item: T }>
	tileCenterX: number
	tileCenterY: number
}): void {
	tooltipState.update((currentState) => {
		// If the same tooltip is already being shown, don't update
		if (currentState.isVisible && currentState.id === params.id) {
			return currentState
		}

		return {
			id: params.id,
			isVisible: true,
			position: params.position,
			item: params.item,
			TooltipComponent: params.TooltipComponent as Component<{ item: GridPlaceable }>,
			tileCenterX: params.tileCenterX,
			tileCenterY: params.tileCenterY,
		}
	})
}

export function hideTooltip(id?: string): void {
	tooltipState.update((state) => {
		// If no tooltip is visible, don't update
		if (!state.isVisible) {
			return state
		}

		// If an id is provided, only hide if it matches the current tooltip
		if (id && state.id !== id) {
			return state
		}

		return {
			...initialState,
		}
	})
}

export function isTooltipVisible(id: string): boolean {
	let isVisible = false
	const unsubscribe = tooltipState.subscribe((state) => {
		isVisible = state.isVisible && state.id === id
	})
	unsubscribe()
	return isVisible
}

// Force hide any tooltip (useful for cleanup scenarios)
export function forceHideTooltip(): void {
	tooltipState.set(initialState)
}

// Global event handlers to hide tooltips in certain situations
function setupGlobalTooltipHandlers() {
	// Hide tooltips on scroll
	const handleScroll = () => {
		forceHideTooltip()
	}

	// Hide tooltips on window resize
	const handleResize = () => {
		forceHideTooltip()
	}

	// Hide tooltips when clicking outside
	const handleClickOutside = (event: MouseEvent) => {
		// Don't hide if clicking on a tooltip or tile element
		const target = event.target as Element
		if (target.closest('[data-tooltip-id]') || target.closest('[data-placement-id]')) {
			return
		}
		forceHideTooltip()
	}

	// Hide tooltips when pressing escape
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			forceHideTooltip()
		}
	}

	// Add event listeners if we're in a browser environment
	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleResize, { passive: true })
		window.addEventListener('click', handleClickOutside, true)
		window.addEventListener('keydown', handleKeyDown)

		// Return cleanup function
		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('click', handleClickOutside, true)
			window.removeEventListener('keydown', handleKeyDown)
		}
	}

	// No-op cleanup if not in browser environment
	return () => {
		// Nothing to clean up in non-browser environments
	}
}

// Initialize global handlers when this module is imported
const cleanupGlobalHandlers = setupGlobalTooltipHandlers()

// Export cleanup function in case it's needed
export { cleanupGlobalHandlers }
