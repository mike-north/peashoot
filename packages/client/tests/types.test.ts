import { describe, it, expect } from 'vitest'
import {
	isDraggableItem,
	type ItemInZone,
	isPlacedDraggableItem,
	type ValidationContext,
	type PendingOperation,
	type IDragState,
} from '../src/private/dnd/types.js'
import type { WithId } from '../src/lib/entities/with-id.js'

describe('DnD Types', () => {
	describe('DraggableItem', () => {
		it('validates draggable items correctly', () => {
			const validItem: WithId = { id: 'test-1' }
			expect(isDraggableItem(validItem)).toBe(true)

			// Invalid cases
			expect(isDraggableItem(null)).toBe(false)
			expect(isDraggableItem(undefined)).toBe(false)
			expect(isDraggableItem({})).toBe(false)
			expect(isDraggableItem({ id: 123 })).toBe(false) // Wrong type
			expect(isDraggableItem({ id: '' })).toBe(true) // Empty string is valid
		})
	})

	describe('ExistingDraggableItem', () => {
		interface TestItem extends WithId {
			name: string
		}

		const testItemGuard = (item: unknown): item is TestItem => {
			return (
				isDraggableItem(item) &&
				'name' in item &&
				typeof (item as TestItem).name === 'string'
			)
		}

		it('validates existing draggable items correctly', () => {
			const validItem: ItemInZone<TestItem> = {
				id: 'placement-1',
				item: { id: 'test-1', name: 'Test Item' },
				sourceZoneId: 'zone-1',
			}

			// Test without item guard
			expect(isPlacedDraggableItem(validItem)).toBe(true)
			expect(isPlacedDraggableItem(null)).toBe(false)
			expect(isPlacedDraggableItem({})).toBe(false)
			expect(isPlacedDraggableItem({ id: 'test' })).toBe(false)

			// Test with item guard
			expect(isPlacedDraggableItem(validItem, testItemGuard)).toBe(true)
			expect(
				isPlacedDraggableItem(
					{
						id: 'placement-1',
						item: { id: 'test-1' }, // Missing name
						sourceZoneId: 'zone-1',
					},
					testItemGuard,
				),
			).toBe(false)
		})
	})

	describe('ValidationContext', () => {
		interface TestItem extends WithId {
			name: string
		}

		interface TestZoneContext {
			id: string
			name: string
		}

		it('allows valid validation contexts', () => {
			const context: ValidationContext<TestItem, TestZoneContext> = {
				operationType: 'item-move-within-zone',
				item: { id: 'test-1', name: 'Test Item' },
				itemInstanceId: 'placement-1',
				sourceZoneId: 'zone-1',
				sourceZoneContext: { id: 'zone-1', name: 'Source Zone' },
				targetZoneId: 'zone-1',
				targetZoneContext: { id: 'zone-1', name: 'Target Zone' },
				sourceX: 0,
				sourceY: 0,
				targetX: 1,
				targetY: 1,
			}

			// TypeScript should compile this without errors
			expect(context).toBeDefined()
		})
	})

	describe('PendingOperation', () => {
		interface TestItem extends WithId {
			name: string
		}

		it('allows valid pending operations', () => {
			const operation: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: { id: 'test-1', name: 'Test Item' },
				zoneId: 'zone-1',
				x: 0,
				y: 0,
				size: 1,
				state: 'pending',
				timestamp: Date.now(),
			}

			// TypeScript should compile this without errors
			expect(operation).toBeDefined()
		})

		it('allows clone operations with original instance info', () => {
			const cloneOperation: PendingOperation<TestItem> = {
				id: 'op-2',
				type: 'clone',
				item: { id: 'test-1', name: 'Test Item' },
				zoneId: 'zone-1',
				x: 0,
				y: 0,
				size: 1,
				state: 'pending',
				timestamp: Date.now(),
				originalInstanceId: 'placement-1',
				originalSourceZoneId: 'zone-1',
			}

			// TypeScript should compile this without errors
			expect(cloneOperation).toBeDefined()
		})
	})

	describe('IDragState', () => {
		interface TestItem extends WithId {
			name: string
		}

		interface TestExisting extends ItemInZone<TestItem> {
			customField: string
		}

		it('allows valid drag states', () => {
			const dragState: IDragState<TestItem, TestExisting> = {
				draggedExistingItem: {
					id: 'placement-1',
					item: { id: 'test-1', name: 'Test Item' },
					sourceZoneId: 'zone-1',
					customField: 'test',
				},
				draggedNewItem: null,
				draggedItemEffectiveSize: 1,
				dragSourceType: 'existing-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: { x: 1, y: 1 },
				sourceZoneId: 'zone-1',
				targetZoneId: 'zone-2',
				targetType: 'drop-zone',
			}

			// TypeScript should compile this without errors
			expect(dragState).toBeDefined()
		})

		it('allows new item drag states', () => {
			const newItemDragState: IDragState<TestItem, TestExisting> = {
				draggedExistingItem: null,
				draggedNewItem: { id: 'test-1', name: 'Test Item' },
				draggedItemEffectiveSize: 1,
				dragSourceType: 'new-item',
				dragOffset: { x: 0, y: 0 },
				dragPosition: { x: 100, y: 100 },
				isCloneMode: false,
				highlightedCell: null,
				sourceZoneId: null,
				targetZoneId: 'zone-1',
				targetType: 'drop-zone',
			}

			// TypeScript should compile this without errors
			expect(newItemDragState).toBeDefined()
		})
	})
})
