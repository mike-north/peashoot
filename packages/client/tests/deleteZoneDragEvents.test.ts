import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writable, get } from 'svelte/store'
import { deleteZoneDragEvents } from '../src/grid/actions/deleteZoneDragEvents.js'
import type { ActionReturn } from 'svelte/action'
import { DraggableItem, ExistingDraggableItem, IDragState } from '../src/dnd/types.js'
import { isDraggingExistingItem } from '../src/dnd/state.js'

// Mock the isDraggingExistingItem function from the correct module
vi.mock('../src/dnd/state.js', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as object),
		isDraggingExistingItem: vi.fn(),
	}
})

// Define the type for options passed to the action
interface DeleteZoneOptions {
	dragStateStore: ReturnType<
		typeof writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	>
	setIsHovered: (hovered: boolean) => void
}

// Use vi.mocked for typed mock
const mockedIsDraggingExistingItem = vi.mocked(isDraggingExistingItem)

describe('deleteZoneDragEvents', () => {
	let node: HTMLElement
	let dragStateStore: ReturnType<
		typeof writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	>
	let setIsHovered: ReturnType<typeof vi.fn>
	let action: ActionReturn<DeleteZoneOptions, Record<string, unknown>> | undefined

	beforeEach(() => {
		node = document.createElement('div')
		dragStateStore = writable<
			IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
		>({
			draggedExistingItem: null,
			draggedNewItem: null,
			draggedItemEffectiveSize: 1,
			dragSourceType: 'existing-item',
			dragOffset: { x: 0, y: 0 },
			dragPosition: { x: 0, y: 0 },
			highlightedCell: null,
			sourceZoneId: null,
			targetZoneId: null,
			targetType: null,
			isCloneMode: false,
		})
		setIsHovered = vi.fn()
		mockedIsDraggingExistingItem.mockReset()
	})

	afterEach(() => {
		if (action && 'destroy' in action && typeof action.destroy === 'function') {
			action.destroy()
		}
		vi.clearAllMocks()
	})

	const mountAction = (options: DeleteZoneOptions) => {
		action = deleteZoneDragEvents(node, options) as {
			update?(...args: unknown[]): void
			destroy?(): void
		}
	}

	it('should add and remove event listeners on mount and destroy', () => {
		const addEventListenerSpy = vi.spyOn(node, 'addEventListener')
		const removeEventListenerSpy = vi.spyOn(node, 'removeEventListener')

		mountAction({ dragStateStore, setIsHovered })

		expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
		expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))

		if (action && 'destroy' in action && typeof action.destroy === 'function') {
			action.destroy()
		}

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'mouseenter',
			expect.any(Function),
		)
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'mouseleave',
			expect.any(Function),
		)
	})

	describe('handleMouseEnter', () => {
		it('should set hovered to true and update drag state if dragging an existing item', () => {
			mockedIsDraggingExistingItem.mockReturnValue(true)
			mountAction({ dragStateStore, setIsHovered })

			const mouseEnterEvent = new MouseEvent('mouseenter')
			node.dispatchEvent(mouseEnterEvent)

			expect(setIsHovered).toHaveBeenCalledWith(true)
			const state = get(dragStateStore)
			expect(state.targetType).toBe('delete-zone')
			expect(state.targetZoneId).toBeNull()
			expect(state.highlightedCell).toBeNull()
		})

		it('should set hovered to true and NOT update drag state if NOT dragging an existing item', () => {
			mockedIsDraggingExistingItem.mockReturnValue(false)
			mountAction({ dragStateStore, setIsHovered })
			const initialDragState = get(dragStateStore)

			const mouseEnterEvent = new MouseEvent('mouseenter')
			node.dispatchEvent(mouseEnterEvent)

			expect(setIsHovered).toHaveBeenCalledWith(true)
			const state = get(dragStateStore)
			expect(state).toEqual(initialDragState)
		})
	})

	describe('handleMouseLeave', () => {
		it('should set hovered to false and update drag state if dragging an existing item', () => {
			mockedIsDraggingExistingItem.mockReturnValue(true)
			mountAction({ dragStateStore, setIsHovered })

			const mouseEnterEvent = new MouseEvent('mouseenter')
			node.dispatchEvent(mouseEnterEvent)
			expect(get(dragStateStore).targetType).toBe('delete-zone')

			const mouseLeaveEvent = new MouseEvent('mouseleave')
			node.dispatchEvent(mouseLeaveEvent)

			expect(setIsHovered).toHaveBeenCalledWith(false)
			const state = get(dragStateStore)
			expect(state.targetType).toBeNull()
		})

		it('should set hovered to false and NOT update drag state if NOT dragging an existing item', () => {
			mockedIsDraggingExistingItem.mockReturnValue(false)
			mountAction({ dragStateStore, setIsHovered })
			const initialDragState = get(dragStateStore)

			const mouseLeaveEvent = new MouseEvent('mouseleave')
			node.dispatchEvent(mouseLeaveEvent)

			expect(setIsHovered).toHaveBeenCalledWith(false)
			const state = get(dragStateStore)
			expect(state).toEqual(initialDragState)
		})
	})

	it('should update options when the update method is called', () => {
		mountAction({ dragStateStore, setIsHovered })

		const newSetIsHovered = vi.fn()
		const newDragStateStore = writable<
			IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
		>({
			draggedExistingItem: {
				id: 'item-1',
				item: { id: 'test', size: 1 },
				sourceZoneId: 'zone-a',
			},
			draggedNewItem: null,
			draggedItemEffectiveSize: 1,
			dragSourceType: 'existing-item',
			dragOffset: { x: 0, y: 0 },
			dragPosition: { x: 0, y: 0 },
			highlightedCell: null,
			sourceZoneId: 'bed1',
			targetZoneId: 'bed2',
			targetType: 'drop-zone',
			isCloneMode: false,
		})

		if (action && 'update' in action && typeof action.update === 'function') {
			action.update({ dragStateStore: newDragStateStore, setIsHovered: newSetIsHovered })
		}

		mockedIsDraggingExistingItem.mockReturnValue(true)
		const mouseEnterEvent = new MouseEvent('mouseenter')
		node.dispatchEvent(mouseEnterEvent)

		expect(newSetIsHovered).toHaveBeenCalledWith(true)
		const state = get(newDragStateStore)
		expect(state.targetType).toBe('delete-zone')

		expect(setIsHovered).not.toHaveBeenCalled()
	})
})
