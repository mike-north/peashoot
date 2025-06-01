import { pendingOperations } from './state'
import type {
	DraggableItem,
	DropZoneContext,
	PendingOperation,
	ValidationContext,
	ValidationState,
} from './types'
import { ASYNC_VALIDATION_TIMEOUT_MS } from './constants'

// Validation function type
export type AsyncValidationFunction<
	TItem extends DraggableItem,
	TZoneCtx extends DropZoneContext,
> = (context: ValidationContext<TItem, TZoneCtx>) => Promise<void>

export function addPendingOperation<TItem extends DraggableItem>(
	operation: Omit<PendingOperation<TItem>, 'id' | 'timestamp'>,
): string {
	const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
	const pendingOp: PendingOperation<TItem> = {
		...operation,
		id,
		timestamp: Date.now(),
	}
	pendingOperations.update((ops) => [...ops, pendingOp])
	return id
}

export function updatePendingOperation(id: string, state: ValidationState) {
	pendingOperations.update((ops) =>
		ops.map((op) => (op.id === id ? { ...op, state } : op)),
	)
}

export function removePendingOperation(id: string) {
	pendingOperations.update((ops) => ops.filter((op) => op.id !== id))
}

export const defaultAsyncValidation: AsyncValidationFunction<
	DraggableItem,
	DropZoneContext
> = async (_context: ValidationContext<DraggableItem, DropZoneContext>) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			// For now, always resolve to allow operations
			resolve()
		}, ASYNC_VALIDATION_TIMEOUT_MS) // Use the constant here
	})
}
