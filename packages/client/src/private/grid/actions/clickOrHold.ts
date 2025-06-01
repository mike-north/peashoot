import type { Action } from 'svelte/action'
import { DEFAULT_HOLD_DURATION_MS } from '../../../private/dnd/constants'

interface ClickOrHoldOptions {
	onClick?: (event: MouseEvent | TouchEvent) => void
	onHold?: (event: MouseEvent | TouchEvent) => void
	holdDuration?: number
}

export const clickOrHold: Action<HTMLElement, ClickOrHoldOptions> = (
	node,
	options = { holdDuration: DEFAULT_HOLD_DURATION_MS },
) => {
	let timer: number | null = null
	let isDragStarted = false
	let hasMouseLeft = false
	let currentOptions = options

	function handleMouseDown(event: MouseEvent) {
		event.preventDefault()
		isDragStarted = false
		hasMouseLeft = false

		timer = window.setTimeout(() => {
			isDragStarted = true
			if (currentOptions.onHold) {
				currentOptions.onHold(event)
			}
		}, currentOptions.holdDuration ?? DEFAULT_HOLD_DURATION_MS)
	}

	function handleMouseUp(event: MouseEvent) {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}

		// Only trigger click if drag wasn't started and mouse hasn't left the element
		if (!isDragStarted && !hasMouseLeft && currentOptions.onClick) {
			currentOptions.onClick(event)
		}
		isDragStarted = false
		hasMouseLeft = false
	}

	function handleMouseLeave() {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}
		hasMouseLeft = true
	}

	function handleTouchStart(event: TouchEvent) {
		event.preventDefault()
		isDragStarted = false
		hasMouseLeft = false

		timer = window.setTimeout(() => {
			isDragStarted = true
			if (currentOptions.onHold) {
				// We need to synthesize a MouseEvent or adapt onHold to accept TouchEvent
				// For now, let's assume onHold can handle it or we adapt it later
				currentOptions.onHold(event)
			}
		}, currentOptions.holdDuration ?? DEFAULT_HOLD_DURATION_MS)
	}

	function handleTouchEnd(event: TouchEvent) {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}

		if (!isDragStarted && !hasMouseLeft && currentOptions.onClick) {
			// We need to synthesize a MouseEvent or adapt onClick to accept TouchEvent
			currentOptions.onClick(event)
		}
		isDragStarted = false
		hasMouseLeft = false
	}

	function handleContextMenu(event: Event) {
		event.preventDefault()
	}

	node.addEventListener('mousedown', handleMouseDown)
	node.addEventListener('mouseup', handleMouseUp)
	node.addEventListener('mouseleave', handleMouseLeave)
	node.addEventListener('touchstart', handleTouchStart, { passive: false })
	node.addEventListener('touchend', handleTouchEnd)
	node.addEventListener('contextmenu', handleContextMenu)

	return {
		update(newOptions: ClickOrHoldOptions) {
			currentOptions = newOptions
		},
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown)
			node.removeEventListener('mouseup', handleMouseUp)
			node.removeEventListener('mouseleave', handleMouseLeave)
			node.removeEventListener('touchstart', handleTouchStart)
			node.removeEventListener('touchend', handleTouchEnd)
			node.removeEventListener('contextmenu', handleContextMenu)
			if (timer) {
				window.clearTimeout(timer)
			}
		},
	}
}
