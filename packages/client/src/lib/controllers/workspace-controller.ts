import type { ValidationResult } from '../types/validation'
import { PlantSchema, type Item, type Workspace, type Zone } from '@peashoot/types'

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

/**
 * Handles high-level business logic for workspace operations
 * including validation rules and feature enablement
 */
export class WorkspaceController<T extends Item = Item>
	implements IWorkspaceController<T>
{
	private placementValidationRules: ValidationRule<T>[] = []
	private deletionValidationRules: ValidationRule<T>[] = []
	private featureFlags: WorkspaceFeatureFlags

	constructor(options?: {
		featureFlags?: Partial<WorkspaceFeatureFlags>
		validationRules?: ValidationRule<T>[]
		deletionValidationRules?: ValidationRule<T>[]
	}) {
		// Default feature flags
		this.featureFlags = {
			canDragItemsWithinZone: true,
			canDragItemsAcrossZones: true,
			canAddItems: false,
			canRemoveItems: true,
			canCloneItems: true,
			showValidationIndicators: false,
			...options?.featureFlags,
		}

		// Initialize with provided validation rules if any
		this.placementValidationRules = options?.validationRules || []
		this.deletionValidationRules = options?.deletionValidationRules || []
	}

	/**
	 * Add a validation rule to the controller
	 */
	addValidationRule(rule: ValidationRule<T>): void {
		this.placementValidationRules.push(rule)
	}

	/**
	 * Add a validation rule for deletion operations
	 */
	addDeletionValidationRule(rule: ValidationRule<T>): void {
		this.deletionValidationRules.push(rule)
	}

	/**
	 * Set all validation rules at once (replaces existing rules)
	 */
	setValidationRules(rules: ValidationRule[]): void {
		this.placementValidationRules = [...rules]
	}

	/**
	 * Update feature flags
	 */
	updateFeatureFlags(flags: Partial<WorkspaceFeatureFlags>): void {
		this.featureFlags = { ...this.featureFlags, ...flags }
	}

	/**
	 * Get current feature flags
	 */
	getFeatureFlags(): WorkspaceFeatureFlags {
		return { ...this.featureFlags }
	}

	/**
	 * Check if a feature is enabled
	 */
	isFeatureEnabled(featureName: keyof WorkspaceFeatureFlags): boolean {
		return this.featureFlags[featureName]
	}

	/**
	 * Validate a workspace operation
	 */
	async validateOperation(context: ValidationContext<T>): Promise<ValidationResult> {
		console.debug('🔍 validateOperation', context.operationType, {
			item: context.item.displayName,
			targetZone: context.targetZone,
			numRules:
				context.operationType === 'item-remove-from-zone'
					? this.deletionValidationRules.length
					: this.placementValidationRules.length,
		})

		const rules =
			context.operationType === 'item-remove-from-zone'
				? this.deletionValidationRules
				: this.placementValidationRules

		console.debug(`⚙️ Running ${rules.length} validation rules`)

		for (const rule of rules) {
			const result = await rule.validate(context)
			if (!result.isValid) {
				console.warn('❌ Validation failed (rule: ' + rule.name + '):', result.reason)
				return result
			}
			console.debug('✅ Validation passed:', rule.name)
		}

		return { isValid: true }
	}

	/**
	 * Specifically validate placement of an item in a zone
	 */
	async validateItemPlacement(
		workspace: Workspace,
		item: T,
		targetZone: Zone,
		x: number,
		y: number,
		itemInstanceId?: string,
	): Promise<ValidationResult> {
		const context: ValidationContext<T> = {
			workspace,
			operationType: itemInstanceId ? 'item-move-within-zone' : 'item-add-to-zone',
			item,
			itemInstanceId,
			targetZone,
			targetX: x,
			targetY: y,
		}

		return this.validateOperation(context)
	}

	/**
	 * Validate moving an item between zones
	 */
	async validateItemMove(
		workspace: Workspace,
		item: T,
		sourceZone: Zone,
		targetZone: Zone,
		x: number,
		y: number,
		itemInstanceId: string,
	): Promise<ValidationResult> {
		const context: ValidationContext<T> = {
			workspace,
			operationType: 'item-move-across-zones',
			item,
			itemInstanceId,
			sourceZone,
			targetZone,
			targetX: x,
			targetY: y,
		}

		return this.validateOperation(context)
	}

	/**
	 * Validate removing an item from a zone
	 */
	async validateItemRemoval(
		workspace: Workspace,
		item: T,
		zone: Zone,
		itemInstanceId: string,
	): Promise<ValidationResult> {
		const context: ValidationContext<T> = {
			workspace,
			operationType: 'item-remove-from-zone',
			item,
			itemInstanceId,
			targetZone: zone,
		}

		return this.validateOperation(context)
	}
}

/**
 * Helper functions to create common validation rules for plant items
 */
export const PlantValidationRules = {
	/**
	 * Rule: Cannot place an item outside the zone boundaries
	 */
	checkBoundaries(): ValidationRule {
		return {
			name: 'checkBoundaries',
			validate: (context) => {
				if (context.targetX === undefined || context.targetY === undefined) {
					return { isValid: false, reason: 'Missing target coordinates' }
				}

				const targetZone = context.targetZone

				const plantItem = PlantSchema.parse(context.item)
				const { size } = plantItem

				if (
					context.targetX < 0 ||
					context.targetY < 0 ||
					context.targetX + size > targetZone.width ||
					context.targetY + size > targetZone.height
				) {
					return { isValid: false, reason: 'Placement is out of bounds' }
				}

				return { isValid: true }
			},
		}
	},
}

export const VALIDATION_RULE_SET = [PlantValidationRules.checkBoundaries()]
