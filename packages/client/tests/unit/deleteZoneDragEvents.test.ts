import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writable, get } from 'svelte/store'
import type { ActionReturn } from 'svelte/action'
import type {
	DraggableItem,
	ExistingDraggableItem,
	IDragState,
} from '../../src/private/dnd/types.js'
import { deleteZoneDragEvents } from '../../src/private/grid/actions/deleteZoneDragEvents.js'

// Mock the isDraggingExistingItem function
const mockedIsDraggingExistingItem = vi.fn()

// Define the type for options passed to the action
interface DeleteZoneOptions {
	dragStateStore: ReturnType<
		typeof writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	>
	setIsHovered: (hovered: boolean) => void
}

describe('deleteZoneDragEvents', () => {
	let node: HTMLElement
	let dragStateStore: ReturnType<
		typeof writable<IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>>
	>
	let setIsHovered: ReturnType<typeof vi.fn>
	let action: ActionReturn<DeleteZoneOptions> | undefined

	beforeEach(() => {
		node = document.createElement('div')
		dragStateStore = writable<
			IDragState<DraggableItem, ExistingDraggableItem<DraggableItem>>
		>({
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
		})
		setIsHovered = vi.fn()
		const result = deleteZoneDragEvents(node, { dragStateStore, setIsHovered })
		if (result) {
			action = result
		}
		vi.useFakeTimers()
	})

	afterEach(() => {
		if (action?.destroy) {
			action.destroy()
		}
		vi.useRealTimers()
	})

	it('should set isHovered to true on mouseenter', () => {
		const event = new MouseEvent('mouseenter')
		node.dispatchEvent(event)
		expect(setIsHovered).toHaveBeenCalledWith(true)
	})

	it('should set isHovered to false on mouseleave', () => {
		const event = new MouseEvent('mouseleave')
		node.dispatchEvent(event)
		expect(setIsHovered).toHaveBeenCalledWith(false)
	})

	it('should update drag state when dragging an existing item', () => {
		const item: ExistingDraggableItem<DraggableItem> = {
			id: 'test-id',
			item: { id: 'item-id' },
			sourceZoneId: 'source-zone',
		}
		mockedIsDraggingExistingItem.mockReturnValue(true)
		dragStateStore.set({
			draggedExistingItem: item,
			draggedNewItem: null,
			draggedItemEffectiveSize: 1,
			dragSourceType: 'existing-item',
			dragOffset: { x: 0, y: 0 },
			dragPosition: { x: 0, y: 0 },
			highlightedCell: null,
			sourceZoneId: 'source-zone',
			targetZoneId: null,
			targetType: null,
			isCloneMode: false,
		})

		const event = new MouseEvent('mouseenter')
		node.dispatchEvent(event)
		const state = get(dragStateStore)
		expect(state.targetType).toBe('delete-zone')
		expect(state.targetZoneId).toBeNull()
		expect(state.highlightedCell).toBeNull()
	})

	it('should not update drag state when dragging a new item', () => {
		mockedIsDraggingExistingItem.mockReturnValue(false)
		dragStateStore.set({
			draggedExistingItem: null,
			draggedNewItem: { id: 'new-item' },
			draggedItemEffectiveSize: 1,
			dragSourceType: 'new-item',
			dragOffset: { x: 0, y: 0 },
			dragPosition: { x: 0, y: 0 },
			highlightedCell: null,
			sourceZoneId: null,
			targetZoneId: null,
			targetType: null,
			isCloneMode: false,
		})

		const event = new MouseEvent('mouseenter')
		node.dispatchEvent(event)
		const state = get(dragStateStore)
		expect(state.targetType).toBeNull()
	})
})
