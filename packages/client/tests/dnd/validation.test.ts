import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writable, get } from 'svelte/store'
import {
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
	defaultAsyncValidation,
} from '../../src/lib/dnd/validation.js'
import { pendingOperations as actualPendingOperationsStore } from '../../src/lib/dnd/state.js'
import type {
	DraggableItem,
	PendingOperation,
	ValidationContext,
	DropZoneContext,
	ValidationState,
	OperationType,
} from '../../src/lib/dnd/types.js'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../../src/lib/dnd/constants.js'

// Mock the Svelte store module that exports pendingOperations
vi.mock('../../src/lib/dnd/state.js', async (importOriginal) => {
	const actual = await importOriginal()
	const mockStore = writable<PendingOperation<DraggableItem>[]>([])
	return {
		...(actual as object), // Spread actual exports to keep other exports like dragState if needed elsewhere
		pendingOperations: mockStore, // Override pendingOperations with our mock
	}
})

// Get a reference to the mocked store for manipulation and assertions
const mockedPendingOperations = actualPendingOperationsStore as unknown as ReturnType<
	typeof writable<PendingOperation<DraggableItem>[]>
>

// Helper to reset the mock store
const resetMockPendingOperations = () => {
	mockedPendingOperations.set([])
}

interface TestItem extends DraggableItem {
	name: string
}

describe('DnD Validation Logic', () => {
	beforeEach(() => {
		resetMockPendingOperations()
		vi.useFakeTimers()
		vi.spyOn(Date, 'now').mockImplementation(() => 1678886400000) // Consistent timestamp
		vi.spyOn(Math, 'random').mockImplementation(() => 0.123456789) // Consistent random part for ID
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.clearAllTimers()
	})

	describe('addPendingOperation', () => {
		it('should add a new operation to the pendingOperations store with a generated ID and timestamp', () => {
			const operationData: Omit<PendingOperation<TestItem>, 'id' | 'timestamp'> = {
				type: 'placement',
				item: { id: 'item-1', name: 'Test Item' },
				zoneId: 'zone-A',
				state: 'pending',
				size: 1,
			}
			const expectedId = 'pending-1678886400000-123456789'

			const id = addPendingOperation(operationData)
			expect(id).toBe(expectedId)

			const ops = get(mockedPendingOperations)
			expect(ops).toHaveLength(1)
			expect(ops[0]).toEqual({
				...operationData,
				id: expectedId,
				timestamp: 1678886400000,
			})
		})
	})

	describe('updatePendingOperation', () => {
		it('should update the state of an existing operation', () => {
			const op1: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: { id: 't1', name: 't1' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			const op2: PendingOperation<TestItem> = {
				id: 'op-2',
				type: 'removal',
				item: { id: 't2', name: 't2' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			mockedPendingOperations.set([op1, op2])

			updatePendingOperation('op-1', 'success')

			const ops = get(mockedPendingOperations)
			expect(ops.find((op) => op.id === 'op-1')?.state).toBe('success')
			expect(ops.find((op) => op.id === 'op-2')?.state).toBe('pending') // Should not change
		})

		it('should not change anything if operation ID does not exist', () => {
			const op1: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: { id: 't1', name: 't1' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			mockedPendingOperations.set([op1])

			updatePendingOperation('non-existent-id', 'error')
			expect(get(mockedPendingOperations)[0].state).toBe('pending')
		})
	})

	describe('removePendingOperation', () => {
		it('should remove an operation by its ID', () => {
			const op1: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: { id: 't1', name: 't1' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			const op2: PendingOperation<TestItem> = {
				id: 'op-2',
				type: 'removal',
				item: { id: 't2', name: 't2' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			mockedPendingOperations.set([op1, op2])

			removePendingOperation('op-1')

			const ops = get(mockedPendingOperations)
			expect(ops).toHaveLength(1)
			expect(ops[0].id).toBe('op-2')
		})

		it('should not change anything if operation ID does not exist', () => {
			const op1: PendingOperation<TestItem> = {
				id: 'op-1',
				type: 'placement',
				item: { id: 't1', name: 't1' },
				state: 'pending',
				timestamp: Date.now(),
				size: 1,
			}
			mockedPendingOperations.set([op1])

			removePendingOperation('non-existent-id')
			expect(get(mockedPendingOperations)).toHaveLength(1)
		})
	})

	describe('defaultAsyncValidation', () => {
		it('should resolve after ASYNC_VALIDATION_TIMEOUT_MS', async () => {
			const mockContext: ValidationContext<DraggableItem, DropZoneContext> = {
				operationType: 'item-add-to-zone',
				item: { id: 'item-1' },
			}
			const consoleSpy = vi.spyOn(console, 'log')

			const validationPromise = defaultAsyncValidation(mockContext)
			expect(consoleSpy).not.toHaveBeenCalled() // Not yet

			// Advance timers to just before timeout
			vi.advanceTimersByTime(ASYNC_VALIDATION_TIMEOUT_MS - 1)
			// Check promise state (still pending)
			let promiseResolved = false
			validationPromise.then(() => {
				promiseResolved = true
			})
			await vi.runAllTimersAsync() // Ensure microtasks queue is processed for promise state check
			expect(promiseResolved).toBe(false)
			expect(consoleSpy).not.toHaveBeenCalled()

			// Advance timers to trigger timeout
			vi.advanceTimersByTime(1)
			await validationPromise // Now it should resolve

			expect(promiseResolved).toBe(true)
			expect(consoleSpy).toHaveBeenCalledWith(
				'Async validation called with context:',
				mockContext,
			)
		})

		it('should log the context provided', async () => {
			const mockContext: ValidationContext<DraggableItem, DropZoneContext> = {
				operationType: 'item-move-across-zones',
				item: { id: 'item-2', name: 'Another Item' },
				sourceZoneId: 'zoneA',
				targetZoneId: 'zoneB',
			}
			const consoleSpy = vi.spyOn(console, 'log')
			await defaultAsyncValidation(mockContext)
			vi.runAllTimers() // Ensure timeout completes
			expect(consoleSpy).toHaveBeenCalledWith(
				'Async validation called with context:',
				mockContext,
			)
		})
	})
})
