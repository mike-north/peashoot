import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import {
	pendingOperations,
	dragState,
	isDragStatePopulated,
	isDraggingExistingItem,
	isDraggingNewItem,
	getDraggedItemInfo,
} from '../../src/dnd/state.js'
import type {
	DraggableItem,
	ExistingDraggableItem,
	IDragState,
} from '../../src/dnd/types.js'

// Helper to create a minimal IDragState for testing
const createMockState = <
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
>(
	partialState: Partial<IDragState<TItem, TExisting>> = {},
): IDragState<TItem, TExisting> => ({
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
	...partialState,
})

interface TestItem extends DraggableItem {
	name: string
	size?: number
}

interface TestExistingItem extends ExistingDraggableItem<TestItem> {
	instanceId: string
}

describe('DnD Svelte Stores and Utility Functions', () => {
	describe('pendingOperations store', () => {
		it('should be a writable Svelte store', () => {
			expect(pendingOperations).toBeDefined()
			expect(typeof pendingOperations.subscribe).toBe('function')
			expect(typeof pendingOperations.set).toBe('function')
			expect(typeof pendingOperations.update).toBe('function')
		})

		it('should have an initial value of an empty array', () => {
			expect(get(pendingOperations)).toEqual([])
		})
	})

	describe('dragState store', () => {
		it('should be a writable Svelte store', () => {
			expect(dragState).toBeDefined()
			expect(typeof dragState.subscribe).toBe('function')
			expect(typeof dragState.set).toBe('function')
			expect(typeof dragState.update).toBe('function')
		})

		it('should have correct initial values', () => {
			const initialState = get(dragState) as IDragState<
				DraggableItem,
				ExistingDraggableItem<DraggableItem>
			>
			expect(initialState.draggedExistingItem).toBeNull()
			expect(initialState.draggedNewItem).toBeNull()
			expect(initialState.draggedItemEffectiveSize).toBe(1)
			expect(initialState.dragSourceType).toBe('existing-item')
			expect(initialState.dragOffset).toEqual({ x: 0, y: 0 })
			expect(initialState.dragPosition).toEqual({ x: 0, y: 0 })
			expect(initialState.highlightedCell).toBeNull()
			expect(initialState.sourceZoneId).toBeNull()
			expect(initialState.targetZoneId).toBeNull()
			expect(initialState.targetType).toBeNull()
			expect(initialState.isCloneMode).toBe(false)
		})
	})

	describe('isDragStatePopulated', () => {
		it('should return true if draggedExistingItem is present and position is not zero', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				draggedExistingItem: {
					id: 'ext-1',
					item: { id: 'item-1', name: 'Test' },
					instanceId: 'i-1',
					sourceZoneId: 'zoneA',
				},
				dragPosition: { x: 10, y: 10 },
			})
			expect(isDragStatePopulated(state)).toBe(true)
		})

		it('should return true if draggedNewItem is present and position is not zero', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				draggedNewItem: { id: 'new-1', name: 'New Test' },
				dragPosition: { x: 10, y: 10 },
			})
			expect(isDragStatePopulated(state)).toBe(true)
		})

		it('should return false if no item is being dragged', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragPosition: { x: 10, y: 10 },
			})
			expect(isDragStatePopulated(state)).toBe(false)
		})

		it('should return false if item is present but position is zero', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				draggedNewItem: { id: 'new-1', name: 'New Test' },
				dragPosition: { x: 0, y: 0 }, // Still at origin
			})
			expect(isDragStatePopulated(state)).toBe(false)
		})
		it('should return true if item is present and only one coordinate of position is non-zero', () => {
			const state1 = createMockState<TestItem, TestExistingItem>({
				draggedNewItem: { id: 'new-1', name: 'New Test' },
				dragPosition: { x: 10, y: 0 },
			})
			expect(isDragStatePopulated(state1)).toBe(true)

			const state2 = createMockState<TestItem, TestExistingItem>({
				draggedExistingItem: {
					id: 'ext-1',
					item: { id: 'item-1', name: 'Test' },
					instanceId: 'i-1',
					sourceZoneId: 'zoneA',
				},
				dragPosition: { x: 0, y: 10 },
			})
			expect(isDragStatePopulated(state2)).toBe(true)
		})
	})

	describe('isDraggingExistingItem', () => {
		it('should return true for a valid existing item drag state', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: {
					id: 'ext-1',
					item: { id: 'item-1', name: 'Test' },
					instanceId: 'i-1',
					sourceZoneId: 'zoneA',
				},
				sourceZoneId: 'zoneA',
			})
			expect(isDraggingExistingItem(state)).toBe(true)
			// Type guard check (if possible in test, otherwise implicit)
			if (isDraggingExistingItem(state)) {
				expect(state.draggedExistingItem?.instanceId).toBe('i-1')
				expect(state.sourceZoneId).toBe('zoneA')
			}
		})

		it('should return false if dragSourceType is not existing-item', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'new-item',
			})
			expect(isDraggingExistingItem(state)).toBe(false)
		})

		it('should return false if draggedExistingItem is null', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: null,
			})
			expect(isDraggingExistingItem(state)).toBe(false)
		})

		it('should return false if sourceZoneId is null', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: {
					id: 'ext-1',
					item: { id: 'item-1', name: 'Test' },
					instanceId: 'i-1',
					sourceZoneId: 'zoneA',
				},
				sourceZoneId: null,
			})
			expect(isDraggingExistingItem(state)).toBe(false)
		})
	})

	describe('isDraggingNewItem', () => {
		it('should return true for a valid new item drag state', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'new-item',
				draggedNewItem: { id: 'new-1', name: 'New Test' },
			})
			expect(isDraggingNewItem(state)).toBe(true)
			if (isDraggingNewItem(state)) {
				expect(state.draggedNewItem?.name).toBe('New Test')
			}
		})

		it('should return false if dragSourceType is not new-item', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
			})
			expect(isDraggingNewItem(state)).toBe(false)
		})

		it('should return false if draggedNewItem is null', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'new-item',
				draggedNewItem: null,
			})
			expect(isDraggingNewItem(state)).toBe(false)
		})
	})

	describe('getDraggedItemInfo', () => {
		const existingItemData: TestItem = { id: 'item-1', name: 'Existing Data', size: 2 }
		const existingItem: TestExistingItem = {
			id: 'ext-1',
			item: existingItemData,
			instanceId: 'i-1',
			sourceZoneId: 'zoneA',
		}
		const newItemData: TestItem = { id: 'new-1', name: 'New Data', size: 4 }

		it('should return itemData and effectiveSize for an existing item (uses existingItem.size)', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: existingItem,
				sourceZoneId: 'zoneA',
				draggedItemEffectiveSize: 2,
			})
			const info = getDraggedItemInfo(state)
			expect(info).toEqual({ item: existingItemData, effectiveSize: 2 })
		})

		it('should return itemData and effectiveSize for an existing item (uses itemData.size)', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: existingItem,
				sourceZoneId: 'zoneA',
				draggedItemEffectiveSize: 2,
			})
			const info = getDraggedItemInfo(state)
			expect(info).toEqual({ item: existingItemData, effectiveSize: 2 })
		})

		it('should return itemData and effectiveSize 1 if no size on existing item or its data', () => {
			const noSizeItemData: TestItem = { id: 'no-size-data', name: 'No Size' }
			const noSizeExistingItem: TestExistingItem = {
				id: 'ext-no',
				item: noSizeItemData,
				instanceId: 'i-ns',
				sourceZoneId: 'zoneA',
			}
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: noSizeExistingItem,
				sourceZoneId: 'zoneA',
			})
			const info = getDraggedItemInfo(state)
			expect(info).toEqual({ item: noSizeItemData, effectiveSize: 1 })
		})

		it('should return item and effectiveSize for a new item', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'new-item',
				draggedNewItem: newItemData,
				draggedItemEffectiveSize: 4,
			})
			const info = getDraggedItemInfo(state)
			expect(info).toEqual({ item: newItemData, effectiveSize: 4 })
		})

		it('should return item and effectiveSize 1 if no size on new item', () => {
			const noSizeNewItem: TestItem = { id: 'new-no-size', name: 'New No Size' }
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'new-item',
				draggedNewItem: noSizeNewItem,
			})
			const info = getDraggedItemInfo(state)
			expect(info).toEqual({ item: noSizeNewItem, effectiveSize: 1 })
		})

		it('should return null if not dragging anything', () => {
			const state = createMockState<TestItem, TestExistingItem>()
			const info = getDraggedItemInfo(state)
			expect(info).toBeNull()
		})

		it('should return null if dragging an invalid state (e.g. existing item without sourceZoneId)', () => {
			const state = createMockState<TestItem, TestExistingItem>({
				dragSourceType: 'existing-item',
				draggedExistingItem: existingItem,
				sourceZoneId: null, // Invalid for isDraggingExistingItem
			})
			const info = getDraggedItemInfo(state)
			expect(info).toBeNull() // Because isDraggingExistingItem will be false
		})
	})
})
