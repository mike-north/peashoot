import { describe, it, expect } from 'vitest'
import {
	type GridDragState,
	isGridDragStatePopulated,
	isGridDraggingExistingItem,
	isGridDraggingNewItem,
	getGridDraggedItemInfo,
	isGridPendingOperation,
	isGridItemRemovalOperation,
} from '../src/private/grid/grid-drag-state.js'
import type { PendingOperation } from '../src/private/dnd/types.js'
import type { GridPlacement, GridPlaceable } from '../src/private/grid/grid-placement.js'

describe('Grid Drag State', () => {
	interface TestItem extends GridPlaceable {
		name: string
	}

	const createTestItem = (id: string, size: number): TestItem => ({
		id,
		name: `Test Item ${id}`,
		displayName: `Test Item ${id}`,
		size,
		presentation: {
			iconPath: '/icons/test.svg',
			accentColor: { red: 255, green: 0, blue: 0 },
		},
	})

	const createTestPlacement = (
		id: string,
		item: TestItem,
		x: number,
		y: number,
		sourceZoneId: string,
	): GridPlacement<TestItem> => ({
		id,
		item,
		sourceZoneId,
		x,
		y,
		size: item.size,
	})

	describe('Grid Drag State Type Guards', () => {
		it('detects populated drag state', () => {
			const emptyState: GridDragState<TestItem> = {
				draggedExistingItem: null,
				draggedNewItem: null,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'new-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 0, y: 0 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: null,
				targetZoneId: null,
				targetType: null,
			}

			const populatedState: GridDragState<TestItem> = {
				...emptyState,
				draggedNewItem: createTestItem('test-1', 1),
				dragPosition: { x: 100, y: 100 },
			}

			expect(isGridDragStatePopulated(emptyState)).toBe(false)
			expect(isGridDragStatePopulated(populatedState)).toBe(true)
		})

		it('identifies existing item drag state', () => {
			const item = createTestItem('test-1', 1)
			const placement = createTestPlacement('placement-1', item, 0, 0, 'zone-1')

			const state: GridDragState<TestItem> = {
				draggedExistingItem: placement,
				draggedNewItem: null,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'existing-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: 'zone-1',
				targetZoneId: null,
				targetType: null,
			}

			expect(isGridDraggingExistingItem(state)).toBe(true)
			expect(isGridDraggingNewItem(state)).toBe(false)

			// Type narrowing should work
			if (isGridDraggingExistingItem(state)) {
				expect(state.draggedExistingItem).toBe(placement)
				expect(state.sourceZoneId).toBe('zone-1')
			}
		})

		it('identifies new item drag state', () => {
			const item = createTestItem('test-1', 1)

			const state: GridDragState<TestItem> = {
				draggedExistingItem: null,
				draggedNewItem: item,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'new-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: null,
				targetZoneId: null,
				targetType: null,
			}

			expect(isGridDraggingNewItem(state)).toBe(true)
			expect(isGridDraggingExistingItem(state)).toBe(false)

			// Type narrowing should work
			if (isGridDraggingNewItem(state)) {
				expect(state.draggedNewItem).toBe(item)
			}
		})
	})

	describe('Grid Drag State Utilities', () => {
		it('gets dragged item info for existing item', () => {
			const item = createTestItem('test-1', 1)
			const placement = createTestPlacement('placement-1', item, 0, 0, 'zone-1')

			const state: GridDragState<TestItem> = {
				draggedExistingItem: placement,
				draggedNewItem: null,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'existing-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: 'zone-1',
				targetZoneId: null,
				targetType: null,
			}

			const info = getGridDraggedItemInfo(state)
			expect(info).not.toBeNull()
			expect(info?.item).toBe(item)
			expect(info?.effectiveSize).toBe(1)
		})

		it('gets dragged item info for new item', () => {
			const item = createTestItem('test-1', 1)

			const state: GridDragState<TestItem> = {
				draggedExistingItem: null,
				draggedNewItem: item,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'new-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: null,
				targetZoneId: null,
				targetType: null,
			}

			const info = getGridDraggedItemInfo(state)
			expect(info).not.toBeNull()
			expect(info?.item).toBe(item)
			expect(info?.effectiveSize).toBe(1)
		})

		it('returns null for empty drag state', () => {
			const state: GridDragState<TestItem> = {
				draggedExistingItem: null,
				draggedNewItem: null,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'new-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 0, y: 0 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: null,
				targetZoneId: null,
				targetType: null,
			}

			const info = getGridDraggedItemInfo(state)
			expect(info).toBeNull()
		})
	})

	describe('Grid Pending Operations', () => {
		const testItemGuard = (item: unknown): item is TestItem => {
			return typeof item === 'object' && item !== null && 'id' in item && 'name' in item
		}

		it('validates grid pending operations', () => {
			const operation: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: createTestItem('test-1', 1),
				zoneId: 'zone-1',
				x: 0,
				y: 0,
				size: 1,
				state: 'pending',
				timestamp: Date.now(),
			}

			expect(isGridPendingOperation(operation, testItemGuard)).toBe(true)
			expect(isGridItemRemovalOperation(operation, testItemGuard)).toBe(false)
		})

		it('identifies removal operations', () => {
			const operation: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'removal',
				item: createTestItem('test-1', 1),
				zoneId: 'zone-1',
				size: 1,
				state: 'pending',
				timestamp: Date.now(),
			}

			expect(isGridPendingOperation(operation, testItemGuard)).toBe(true)
			expect(isGridItemRemovalOperation(operation, testItemGuard)).toBe(true)
		})
	})
})
