import type { Action } from 'svelte/action'
import { DEFAULT_HOLD_DURATION_MS } from '../dnd/constants'

interface ClickOrHoldOptions {
	onClick?: (event: MouseEvent) => void
	onHold?: (event: MouseEvent) => void
	holdDuration?: number
}

export const clickOrHold: Action<HTMLElement, ClickOrHoldOptions> = (
	node,
	options = { holdDuration: DEFAULT_HOLD_DURATION_MS },
) => {
	let timer: number | null = null
	let isDragStarted = false
	const { holdDuration } = options

	function handleMouseDown(event: MouseEvent) {
		event.preventDefault()
		isDragStarted = false

		timer = window.setTimeout(() => {
			isDragStarted = true
			if (options.onHold) {
				options.onHold(event)
			}
		}, holdDuration)
	}

	function handleMouseUp(event: MouseEvent) {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}

		if (!isDragStarted && options.onClick) {
			options.onClick(event)
		}
		isDragStarted = false
	}

	function handleMouseLeave() {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}
		// isDragStarted can remain true if a hold was initiated and mouse left
	}

	function handleTouchStart(event: TouchEvent) {
		event.preventDefault()
		isDragStarted = false

		timer = window.setTimeout(() => {
			isDragStarted = true
			if (options.onHold) {
				// We need to synthesize a MouseEvent or adapt onHold to accept TouchEvent
				// For now, let's assume onHold can handle it or we adapt it later
				options.onHold(event as unknown as MouseEvent)
			}
		}, holdDuration)
	}

	function handleTouchEnd(event: TouchEvent) {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}

		if (!isDragStarted && options.onClick) {
			// We need to synthesize a MouseEvent or adapt onClick to accept TouchEvent
			options.onClick(event as unknown as MouseEvent)
		}
		isDragStarted = false
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
			options = newOptions
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
