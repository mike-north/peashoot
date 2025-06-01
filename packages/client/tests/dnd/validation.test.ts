import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writable, get } from 'svelte/store'
import {
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
	defaultAsyncValidation,
} from '../../src/private/dnd/validation.js'
import { pendingOperations as actualPendingOperationsStore } from '../../src/private/dnd/state.js'
import type {
	DraggableItem,
	PendingOperation,
	ValidationContext,
	DropZoneContext,
} from '../../src/private/dnd/types.js'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../../src/private/dnd/constants.js'

// Mock the Svelte store module that exports pendingOperations
vi.mock('../../src/dnd/state.js', async (importOriginal) => {
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
		// Mock Math.random to return a value that when converted to base-36 and sliced gives a predictable result
		vi.spyOn(Math, 'random').mockImplementation(() => 0.5) // This will give us a predictable base-36 string
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
			const id = addPendingOperation(operationData)
			expect(id).toMatch(/^pending-\d+-[a-z0-9]+$/) // More flexible expectation

			const ops = get(mockedPendingOperations)
			expect(ops).toHaveLength(1)
			expect(ops[0]).toEqual({
				...operationData,
				id: id, // Use the actual returned ID
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

			let promiseResolved = false
			const validationPromise = defaultAsyncValidation(mockContext).then(() => {
				promiseResolved = true
			})

			// Promise should not be resolved immediately
			await Promise.resolve() // Flush microtasks
			expect(promiseResolved).toBe(false)

			// Advance timers to just before timeout
			vi.advanceTimersByTime(ASYNC_VALIDATION_TIMEOUT_MS - 1)
			await Promise.resolve() // Flush microtasks
			expect(promiseResolved).toBe(false)

			// Advance timers to trigger timeout
			vi.advanceTimersByTime(1)
			// Need to wait for the promise itself, not just flush microtasks
			await validationPromise
			expect(promiseResolved).toBe(true)
		})
	})
})
