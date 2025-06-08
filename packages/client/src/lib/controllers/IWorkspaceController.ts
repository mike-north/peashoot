import type { Item } from '../entities/item'
import type { Workspace } from '../entities/workspace'
import type { Zone } from '../entities/zone'
import type { ValidationResult } from '../types/validation'

/**
 * Feature flags that control what workspace operations are enabled
 */
export interface WorkspaceFeatureFlags {
	canDragItemsWithinZone: boolean
	canDragItemsAcrossZones: boolean
	canAddItems: boolean
	canRemoveItems: boolean
	canCloneItems: boolean
	showValidationIndicators: boolean
}

/**
 * Represents different types of workspace operations
 */
export type WorkspaceOperationType =
	| 'item-move-within-zone'
	| 'item-move-across-zones'
	| 'item-add-to-zone'
	| 'item-remove-from-zone'
	| 'item-clone-in-zone'

/**
 * Context for validation checks
 */
export interface ValidationContext<T extends Item = Item> {
	workspace: Workspace
	operationType: WorkspaceOperationType
	item: T
	itemInstanceId?: string | undefined
	sourceZone?: Zone | undefined
	targetZone: Zone
	targetX?: number | undefined
	targetY?: number | undefined
}

/**
 * A rule function that checks if an operation is valid
 */
export interface ValidationRule<T extends Item = Item> {
	name: string
	validate: (
		context: ValidationContext<T>,
	) => ValidationResult | Promise<ValidationResult>
}

export interface IWorkspaceController<T extends Item = Item> {
	validateOperation(context: ValidationContext<T>): Promise<ValidationResult>
	isFeatureEnabled(featureName: keyof WorkspaceFeatureFlags): boolean
	validateItemMove(
		workspace: Workspace,
		item: T,
		sourceZone: Zone,
		targetZone: Zone,
		x: number,
		y: number,
		itemInstanceId: string,
	): Promise<ValidationResult>
	validateItemRemoval(
		workspace: Workspace,
		item: T,
		zone: Zone,
		itemInstanceId: string,
	): Promise<ValidationResult>
	validateItemPlacement(
		workspace: Workspace,
		item: T,
		targetZone: Zone,
		x: number,
		y: number,
		itemInstanceId?: string,
	): Promise<ValidationResult>
}
