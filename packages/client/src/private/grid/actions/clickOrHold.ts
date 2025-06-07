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
	let holdFired = false
	let clickFired = false
	let interactionToken = 0
	let currentOptions = options

	function clearTimer() {
		if (timer) {
			window.clearTimeout(timer)
			timer = null
		}
	}

	function resetState() {
		isDragStarted = false
		hasMouseLeft = false
		holdFired = false
		clickFired = false
	}

	function endInteraction() {
		interactionToken++
		clearTimer()
	}

	function handleMouseDown(event: MouseEvent) {
		endInteraction()
		resetState()
		event.preventDefault()

		const myToken = ++interactionToken
		timer = window.setTimeout(() => {
			if (myToken === interactionToken && !hasMouseLeft && !holdFired && !clickFired) {
				isDragStarted = true
				holdFired = true
				if (currentOptions.onHold) {
					currentOptions.onHold(event)
				}
				clearTimer()
			}
		}, currentOptions.holdDuration ?? DEFAULT_HOLD_DURATION_MS)
	}

	function handleMouseUp(event: MouseEvent) {
		endInteraction()
		if (
			!isDragStarted &&
			!hasMouseLeft &&
			!holdFired &&
			!clickFired &&
			currentOptions.onClick
		) {
			clickFired = true
			currentOptions.onClick(event)
		}
		resetState()
	}

	function handleMouseLeave() {
		endInteraction()
		hasMouseLeft = true
	}

	function handleTouchStart(event: TouchEvent) {
		endInteraction()
		resetState()
		event.preventDefault()

		const myToken = ++interactionToken
		timer = window.setTimeout(() => {
			if (myToken === interactionToken && !hasMouseLeft && !holdFired && !clickFired) {
				isDragStarted = true
				holdFired = true
				if (currentOptions.onHold) {
					currentOptions.onHold(event)
				}
				clearTimer()
			}
		}, currentOptions.holdDuration ?? DEFAULT_HOLD_DURATION_MS)
	}

	function handleTouchEnd(event: TouchEvent) {
		endInteraction()
		if (
			!isDragStarted &&
			!hasMouseLeft &&
			!holdFired &&
			!clickFired &&
			currentOptions.onClick
		) {
			clickFired = true
			currentOptions.onClick(event)
		}
		resetState()
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
			endInteraction()
			resetState()
			currentOptions = { ...currentOptions, ...newOptions }
		},
		destroy() {
			endInteraction()
			node.removeEventListener('mousedown', handleMouseDown)
			node.removeEventListener('mouseup', handleMouseUp)
			node.removeEventListener('mouseleave', handleMouseLeave)
			node.removeEventListener('touchstart', handleTouchStart)
			node.removeEventListener('touchend', handleTouchEnd)
			node.removeEventListener('contextmenu', handleContextMenu)
		},
	}
}
