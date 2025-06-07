import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { clickOrHold } from '../../src/private/grid/actions/clickOrHold.js'
import { DEFAULT_HOLD_DURATION_MS } from '../../src/private/dnd/constants.js'
import type { ActionReturn } from 'svelte/action'

interface ClickOrHoldOptions {
	onClick?: (event: MouseEvent | TouchEvent) => void
	onHold?: (event: MouseEvent | TouchEvent) => void
	holdDuration?: number
}

describe('clickOrHold Action', () => {
	let node: HTMLElement
	let onClick: ReturnType<typeof vi.fn>
	let onHold: ReturnType<typeof vi.fn>
	let action: ActionReturn<ClickOrHoldOptions> | undefined

	const dispatchMouseEvent = (
		type: 'mousedown' | 'mouseup' | 'mouseleave',
		target?: EventTarget,
	) => {
		const event = new MouseEvent(type, { bubbles: true, cancelable: true })
		;(target || node).dispatchEvent(event)
		return event
	}

	const dispatchTouchEvent = (type: 'touchstart' | 'touchend', target?: EventTarget) => {
		const event = new TouchEvent(type, { bubbles: true, cancelable: true })
		;(target || node).dispatchEvent(event)
		return event
	}

	beforeEach(() => {
		node = document.createElement('div')
		onClick = vi.fn()
		onHold = vi.fn()
		vi.useFakeTimers()
	})

	afterEach(() => {
		if (action?.destroy) {
			action.destroy()
		}
		vi.useRealTimers()
	})

	it('should call onClick when mouse is released before hold duration', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const event = new MouseEvent('mousedown')
		node.dispatchEvent(event)
		vi.advanceTimersByTime(DEFAULT_HOLD_DURATION_MS - 1)
		node.dispatchEvent(new MouseEvent('mouseup'))
		expect(onClick).toHaveBeenCalled()
		expect(onHold).not.toHaveBeenCalled()
	})

	it('should call onHold when mouse is held for the duration', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const event = new MouseEvent('mousedown')
		node.dispatchEvent(event)
		vi.advanceTimersByTime(DEFAULT_HOLD_DURATION_MS)
		expect(onHold).toHaveBeenCalled()
		node.dispatchEvent(new MouseEvent('mouseup'))
		expect(onClick).not.toHaveBeenCalled()
	})

	it('should not call onClick if mouse leaves the element', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const event = new MouseEvent('mousedown')
		node.dispatchEvent(event)
		node.dispatchEvent(new MouseEvent('mouseleave'))
		node.dispatchEvent(new MouseEvent('mouseup'))
		expect(onClick).not.toHaveBeenCalled()
		expect(onHold).not.toHaveBeenCalled()
	})

	it('should handle touch events', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const event = new TouchEvent('touchstart')
		node.dispatchEvent(event)
		vi.advanceTimersByTime(DEFAULT_HOLD_DURATION_MS)
		expect(onHold).toHaveBeenCalled()
		node.dispatchEvent(new TouchEvent('touchend'))
		expect(onClick).not.toHaveBeenCalled()
	})

	it('should prevent context menu', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const event = new MouseEvent('contextmenu')
		const preventDefault = vi.spyOn(event, 'preventDefault')
		node.dispatchEvent(event)
		expect(preventDefault).toHaveBeenCalled()
	})

	it('should update options when update is called', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const newOnClick = vi.fn()
		if (action?.update) {
			action.update({ onClick: newOnClick })
			const event = new MouseEvent('mousedown')
			node.dispatchEvent(event)
			vi.advanceTimersByTime(DEFAULT_HOLD_DURATION_MS - 1)
			node.dispatchEvent(new MouseEvent('mouseup'))
			expect(newOnClick).toHaveBeenCalled()
			expect(onClick).not.toHaveBeenCalled()
		}
	})

	it('should use DEFAULT_HOLD_DURATION_MS if holdDuration is not provided', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		dispatchMouseEvent('mousedown')
		vi.advanceTimersByTime(DEFAULT_HOLD_DURATION_MS + 50)
		expect(onHold).toHaveBeenCalledOnce()
	})

	it('should clear timer on mouseleave', () => {
		action = clickOrHold(node, { onClick, onHold, holdDuration: 100 }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		dispatchMouseEvent('mousedown')
		vi.advanceTimersByTime(50)
		dispatchMouseEvent('mouseleave')
		vi.advanceTimersByTime(100) // Advance past original hold time
		expect(onHold).not.toHaveBeenCalled()
		// Subsequent mouseup should not trigger click if mouse already left
		dispatchMouseEvent('mouseup')
		expect(onClick).not.toHaveBeenCalled()
	})

	it('should prevent default on mousedown and touchstart', () => {
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const mouseDownEvent = dispatchMouseEvent('mousedown')
		expect(mouseDownEvent.defaultPrevented).toBe(true)
		const touchStartEvent = dispatchTouchEvent('touchstart')
		expect(touchStartEvent.defaultPrevented).toBe(true)
	})

	it('should prevent default on contextmenu', () => {
		action = clickOrHold(node, {}) as ActionReturn<ClickOrHoldOptions> | undefined // No handlers needed for this test
		const contextMenuEvent = new Event('contextmenu', { bubbles: true, cancelable: true })
		node.dispatchEvent(contextMenuEvent)
		expect(contextMenuEvent.defaultPrevented).toBe(true)
	})

	it('should update options via the update method', () => {
		action = clickOrHold(node, { onClick, onHold, holdDuration: 100 }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const newOnClick = vi.fn()
		const newOnHold = vi.fn()
		if (action && 'update' in action && typeof action.update === 'function') {
			action.update({ onClick: newOnClick, onHold: newOnHold, holdDuration: 50 })
		}

		// Test with new holdDuration
		dispatchMouseEvent('mousedown')
		vi.advanceTimersByTime(75)
		expect(newOnHold).toHaveBeenCalledOnce()
		expect(onHold).not.toHaveBeenCalled()
		dispatchMouseEvent('mouseup') // Release hold
		newOnHold.mockClear() // Clear for next check

		// Test new onClick
		dispatchMouseEvent('mousedown')
		vi.advanceTimersByTime(25)
		dispatchMouseEvent('mouseup')
		expect(newOnClick).toHaveBeenCalledOnce()
		expect(onClick).not.toHaveBeenCalled()
	})

	it('should correctly handle touch events for click', () => {
		action = clickOrHold(node, { onClick, onHold, holdDuration: 100 }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		dispatchTouchEvent('touchstart')
		vi.advanceTimersByTime(50)
		const endEvent = dispatchTouchEvent('touchend')
		expect(onClick).toHaveBeenCalledOnce()
		expect(onClick.mock.calls[0][0]).toBe(endEvent)
		expect(onHold).not.toHaveBeenCalled()
	})

	it('should correctly handle touch events for hold', () => {
		action = clickOrHold(node, { onClick, onHold, holdDuration: 100 }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		const startEvent = dispatchTouchEvent('touchstart')
		vi.advanceTimersByTime(150)
		expect(onHold).toHaveBeenCalledOnce()
		expect(onHold.mock.calls[0][0]).toBe(startEvent)
		expect(onClick).not.toHaveBeenCalled()
		dispatchTouchEvent('touchend')
		expect(onClick).not.toHaveBeenCalled()
	})

	it('should remove all event listeners on destroy', () => {
		const addEventListenerSpy = vi.spyOn(node, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(node, 'removeEventListener')
		action = clickOrHold(node, { onClick, onHold }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined

		const handlers: Record<string, EventListenerOrEventListenerObject | undefined> = {}
		addEventListenerSpy.mock.calls.forEach((call) => {
			if (typeof call[0] === 'string' && typeof call[1] === 'function') {
				handlers[call[0]] = call[1]
			}
		})

		if (action && 'destroy' in action && typeof action.destroy === 'function') {
			action.destroy()
		}

		expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', handlers.mousedown)
		expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', handlers.mouseup)
		expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', handlers.mouseleave)
		expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', handlers.touchstart)
		expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', handlers.touchend)
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'contextmenu',
			handlers.contextmenu,
		)
	})

	it('should clear timer on destroy if active', () => {
		const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
		action = clickOrHold(node, { onHold, holdDuration: 100 }) as
			| ActionReturn<ClickOrHoldOptions>
			| undefined
		dispatchMouseEvent('mousedown') // Start timer
		vi.advanceTimersByTime(50) // Timer is active but not fired

		if (action && 'destroy' in action && typeof action.destroy === 'function') {
			action.destroy()
		}
		expect(clearTimeoutSpy).toHaveBeenCalled()
	})
})
