import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
	DragManager,
	dragManager as globalDragManagerInstance,
} from '../../src/private/dnd/drag-manager.js'
import { dragState } from '../../src/private/dnd/state.js'
import type {
	DraggableItem,
	ExistingDraggableItem,
	IDragState,
} from '../../src/private/dnd/types.js'
import { get } from 'svelte/store'

// Mock the Svelte store
vi.mock('../../src/dnd/state.js', async () => {
	const initialDragState = {
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
	}
	return {
		dragState: (await import('svelte/store')).writable(initialDragState),
	}
})

// Helper function to reset the mock store
const resetMockDragState = () => {
	dragState.set({
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
}

// Define a type for our test items
interface TestItem extends DraggableItem {
	name: string
	category: string
	size?: number // Added optional size property
}

interface TestExistingItem extends ExistingDraggableItem<TestItem> {
	placementId: string
}

describe('DragManager', () => {
	let manager: DragManager<TestItem>

	beforeEach(() => {
		resetMockDragState()
		manager = new DragManager<TestItem>((item: TestItem) => item.size || 1)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('startDraggingExistingItem', () => {
		const mockExistingItem: TestExistingItem = {
			id: 'existing-123',
			item: {
				id: 'item-abc',
				name: 'My Test Item',
				category: 'Test Category',
				size: 2,
			},
			placementId: 'p-001',
			sourceZoneId: 'zone-A',
		}
		const sourceZoneId = 'zone-A'

		it('should update dragState correctly when starting to drag an existing item', () => {
			const mockEvent = new MouseEvent('mousedown', {
				clientX: 100,
				clientY: 200,
				metaKey: false,
				altKey: false,
			})
			manager.startDraggingExistingItem(mockExistingItem, sourceZoneId, mockEvent)

			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedExistingItem).toEqual(mockExistingItem)
			expect(currentState.draggedNewItem).toBeNull()
			expect(currentState.draggedItemEffectiveSize).toBe(2) // Uses item.size
			expect(currentState.dragSourceType).toBe('existing-item')
			expect(currentState.dragOffset).toEqual({ x: 100, y: 200 })
			expect(currentState.dragPosition).toEqual({ x: 100, y: 200 })
			expect(currentState.sourceZoneId).toBe(sourceZoneId)
			expect(currentState.isCloneMode).toBe(false)
			expect(currentState.targetZoneId).toBeNull()
			expect(currentState.targetType).toBeNull()
		})

		it('should use item.size if existingItem.size is not present', () => {
			const itemWithoutExplicitSize: TestExistingItem = {
				...mockExistingItem,
			}
			const mockEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 20 })
			manager.startDraggingExistingItem(itemWithoutExplicitSize, sourceZoneId, mockEvent)
			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedItemEffectiveSize).toBe(2) // Uses item.size
		})

		it('should default to size 1 if no size is specified anywhere', () => {
			const itemWithNoSize: TestExistingItem = {
				id: 'no-size-item',
				item: { id: 'item-no-size', name: 'No Size Item', category: 'Test' }, // No size property
				placementId: 'p-002',
				sourceZoneId: 'zone-B',
			}
			const mockEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 })
			manager.startDraggingExistingItem(itemWithNoSize, 'zone-B', mockEvent)
			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedItemEffectiveSize).toBe(1)
		})

		it('should set isCloneMode to true if metaKey is pressed', () => {
			const mockEvent = new MouseEvent('mousedown', {
				clientX: 0,
				clientY: 0,
				metaKey: true,
			})
			manager.startDraggingExistingItem(mockExistingItem, sourceZoneId, mockEvent)
			const state = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(state.isCloneMode).toBe(true)
		})

		it('should set isCloneMode to true if altKey is pressed', () => {
			const mockEvent = new MouseEvent('mousedown', {
				clientX: 0,
				clientY: 0,
				altKey: true,
			})
			manager.startDraggingExistingItem(mockExistingItem, sourceZoneId, mockEvent)
			const state = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(state.isCloneMode).toBe(true)
		})
	})

	describe('startDraggingNewItem', () => {
		const mockNewItem: TestItem = {
			id: 'new-item-xyz',
			name: 'Fresh Item',
			category: 'New Category',
			size: 2,
		}

		it('should update dragState correctly when starting to drag a new item', () => {
			const mockEvent = new MouseEvent('mousedown', { clientX: 50, clientY: 60 })
			manager.startDraggingNewItem(mockNewItem, mockEvent)

			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedNewItem).toEqual(mockNewItem)
			expect(currentState.draggedExistingItem).toBeNull()
			expect(currentState.draggedItemEffectiveSize).toBe(2)
			expect(currentState.dragSourceType).toBe('new-item')
			expect(currentState.dragOffset).toEqual({ x: 50, y: 60 })
			expect(currentState.dragPosition).toEqual({ x: 50, y: 60 })
			expect(currentState.sourceZoneId).toBeNull()
			expect(currentState.isCloneMode).toBe(false) // Always false for new items
		})

		it('should default to size 1 if newItemData.size is not present', () => {
			const newItemWithoutSize: TestItem = {
				id: 'new-no-size',
				name: 'No Size',
				category: 'Test',
			}
			const mockEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 })
			manager.startDraggingNewItem(newItemWithoutSize, mockEvent)
			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedItemEffectiveSize).toBe(1)
		})
	})

	describe('cleanup', () => {
		it('should reset dragState to its initial/default state', () => {
			// First, set some drag state
			const mockEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 20 })
			manager.startDraggingNewItem(
				{ id: 'temp-item', name: 'Temp', category: 'Temp' },
				mockEvent,
			)
			const state = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(state.draggedNewItem).not.toBeNull() // Ensure state is dirty

			manager.cleanup()
			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>

			expect(currentState.draggedExistingItem).toBeNull()
			expect(currentState.draggedNewItem).toBeNull()
			expect(currentState.draggedItemEffectiveSize).toBe(1)
			expect(currentState.dragSourceType).toBe('existing-item') // Default value
			expect(currentState.dragOffset).toEqual({ x: 0, y: 0 })
			expect(currentState.dragPosition).toEqual({ x: 0, y: 0 })
			expect(currentState.highlightedCell).toBeNull()
			expect(currentState.sourceZoneId).toBeNull()
			expect(currentState.targetZoneId).toBeNull()
			expect(currentState.targetType).toBeNull()
			expect(currentState.isCloneMode).toBe(false)
		})
	})

	describe('getCurrentDragState', () => {
		it('should return the Svelte store instance itself', () => {
			const store = manager.getCurrentDragState()
			expect(store).toBe(dragState) // Check if it's the same store instance we mocked
			expect(typeof store.subscribe).toBe('function')
			expect(typeof store.set).toBe('function')
			expect(typeof store.update).toBe('function')
		})
	})

	describe('Global dragManager Instance', () => {
		it('should be an instance of DragManager', () => {
			expect(globalDragManagerInstance).toBeInstanceOf(DragManager)
		})

		// You can add a simple test to ensure the global instance also works, e.g., a cleanup call
		it('global instance cleanup should reset the mock store', () => {
			const mockEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 20 })
			// Use the global instance to modify the state
			globalDragManagerInstance.startDraggingNewItem(
				{ id: 'global-item', name: 'Global', category: 'Global' },
				mockEvent,
			)
			const state = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(state.draggedNewItem?.id).toBe('global-item')

			globalDragManagerInstance.cleanup()
			const currentState = get(dragState) as IDragState<TestItem, TestExistingItem>
			expect(currentState.draggedNewItem).toBeNull()
			expect(currentState.dragSourceType).toBe('existing-item')
		})
	})
})
