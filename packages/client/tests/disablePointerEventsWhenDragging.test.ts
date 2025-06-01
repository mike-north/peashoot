import { describe, it, expect, beforeEach } from 'vitest'
import { disablePointerEventsWhenDragging } from '../src/private/grid/actions/disablePointerEventsWhenDragging.js'
import type { ActionReturn } from 'svelte/action'
import {
	DraggableItem,
	ExistingDraggableItem,
	IDragState,
} from '../src/private/dnd/types.js'

const createMockDragState = (
	isDragging: boolean,
): Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>> => {
	const baseState: IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>> = {
		draggedExistingItem: null,
		draggedNewItem: null,
		draggedItemEffectiveSize: 1,
		dragSourceType: 'new-item',
		dragOffset: { x: 0, y: 0 },
		dragPosition: { x: 0, y: 0 },
		highlightedCell: null,
		sourceZoneId: null,
		targetZoneId: null,
		targetType: null,
		isCloneMode: false,
	}
	if (isDragging) {
		baseState.draggedNewItem = { id: 'test-item', name: 'Test' } as DraggableItem
	}
	return Object.freeze(baseState)
}

describe('disablePointerEventsWhenDragging', () => {
	let node: HTMLElement
	let action:
		| ActionReturn<
				Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
		  >
		| undefined

	beforeEach(() => {
		node = document.createElement('div')
		node.style.pointerEvents = 'auto'
	})

	it('should set pointerEvents to "none" if initially dragging', () => {
		const initialDragState = createMockDragState(true)
		disablePointerEventsWhenDragging(node, initialDragState)
		expect(node.style.pointerEvents).toBe('none')
	})

	it('should set pointerEvents to "auto" if initially not dragging', () => {
		const initialDragState = createMockDragState(false)
		disablePointerEventsWhenDragging(node, initialDragState)
		expect(node.style.pointerEvents).toBe('auto')
	})

	it('should update pointerEvents to "none" when dragging starts', () => {
		const initialDragState = createMockDragState(false)
		action = disablePointerEventsWhenDragging(node, initialDragState) as
			| ActionReturn<
					Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
			  >
			| undefined
		expect(node.style.pointerEvents).toBe('auto')

		const draggingState = createMockDragState(true)
		if (action && action.update) {
			action.update(draggingState)
		}
		expect(node.style.pointerEvents).toBe('none')
	})

	it('should update pointerEvents to "auto" when dragging stops', () => {
		const initialDragState = createMockDragState(true)
		action = disablePointerEventsWhenDragging(node, initialDragState) as
			| ActionReturn<
					Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
			  >
			| undefined
		expect(node.style.pointerEvents).toBe('none')

		const notDraggingState = createMockDragState(false)
		if (action && action.update) {
			action.update(notDraggingState)
		}
		expect(node.style.pointerEvents).toBe('auto')
	})

	it('should handle updates when draggedExistingItem is present', () => {
		const initialDragState = createMockDragState(false)
		action = disablePointerEventsWhenDragging(node, initialDragState) as
			| ActionReturn<
					Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
			  >
			| undefined
		expect(node.style.pointerEvents).toBe('auto')

		const draggingStateWithExisting: Readonly<
			IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
		> = {
			...createMockDragState(false),
			draggedExistingItem: {
				id: 'existing-1',
				item: { id: 'item-data' } as DraggableItem,
			} as ExistingDraggableItem<DraggableItem>,
		}
		if (action && action.update) {
			action.update(draggingStateWithExisting)
		}
		expect(node.style.pointerEvents).toBe('none')
	})

	it('should work with SVGElement', () => {
		const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		const initialDragState = createMockDragState(true)
		action = disablePointerEventsWhenDragging(svgNode, initialDragState) as
			| ActionReturn<
					Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
			  >
			| undefined
		expect(svgNode.style.pointerEvents).toBe('none')

		const notDraggingState = createMockDragState(false)
		if (action && action.update) {
			action.update(notDraggingState)
		}
		expect(svgNode.style.pointerEvents).toBe('auto')
	})

	it('should not have a destroy method defined in its return object', () => {
		const initialDragState = createMockDragState(false)
		action = disablePointerEventsWhenDragging(node, initialDragState) as
			| ActionReturn<
					Readonly<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
			  >
			| undefined
		if (action) {
			expect(action.destroy).toBeUndefined()
		} else {
			expect(action).toBeUndefined()
		}
	})
})
