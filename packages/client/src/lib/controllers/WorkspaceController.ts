import type { Item } from '../entities/item'
import type { Workspace } from '../entities/workspace'
import type { Zone } from '../entities/zone'
import type { PlantMetadata } from '../entities/plant-metadata'

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
 * Result of a validation check
 */
export interface ValidationResult {
	isValid: boolean
	reason?: string
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
export type ValidationRule<T extends Item = Item> = (
	context: ValidationContext<T>,
) => ValidationResult | Promise<ValidationResult>

/**
 * Handles high-level business logic for workspace operations
 * including validation rules and feature enablement
 */
export class WorkspaceController<T extends Item = Item> {
	private validationRules: ValidationRule<T>[] = []
	private featureFlags: WorkspaceFeatureFlags

	constructor(options?: {
		featureFlags?: Partial<WorkspaceFeatureFlags>
		validationRules?: ValidationRule<T>[]
	}) {
		// Default feature flags
		this.featureFlags = {
			canDragItemsWithinZone: true,
			canDragItemsAcrossZones: true,
			canAddItems: true,
			canRemoveItems: true,
			canCloneItems: true,
			showValidationIndicators: true,
			...options?.featureFlags,
		}

		// Initialize with provided validation rules if any
		this.validationRules = options?.validationRules || []
	}

	/**
	 * Add a validation rule to the controller
	 */
	addValidationRule(rule: ValidationRule): void {
		this.validationRules.push(rule)
	}

	/**
	 * Set all validation rules at once (replaces existing rules)
	 */
	setValidationRules(rules: ValidationRule[]): void {
		this.validationRules = [...rules]
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
		// Apply all validation rules
		for (const rule of this.validationRules) {
			const result = await rule(context)
			if (!result.isValid) {
				return result
			}
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
	checkBoundaries(): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			if (context.targetX === undefined || context.targetY === undefined) {
				return { isValid: false, reason: 'Missing target coordinates' }
			}

			const targetZone = context.targetZone

			const plantItem = context.item
			const size = plantItem.metadata.plantingDistanceInFeet || 1

			if (
				context.targetX < 0 ||
				context.targetY < 0 ||
				context.targetX + size > targetZone.width ||
				context.targetY + size > targetZone.height
			) {
				return { isValid: false, reason: 'Placement is out of bounds' }
			}

			return { isValid: true }
		}
	},

	/**
	 * Rule: Cannot place an item that overlaps with existing items
	 */
	noOverlaps(): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			if (context.targetX === undefined || context.targetY === undefined) {
				return { isValid: false, reason: 'Missing target coordinates' }
			}

			const targetZone = context.targetZone

			const plantItem = context.item
			const size = plantItem.metadata.plantingDistanceInFeet || 1

			for (const placement of targetZone.placements) {
				// Skip the item itself in case of a move
				if (context.itemInstanceId && placement.id === context.itemInstanceId) {
					continue
				}

				const existingItem = placement.item as Item<PlantMetadata>
				const existingSize = existingItem.metadata.plantingDistanceInFeet || 1

				if (
					context.targetX < placement.x + existingSize &&
					context.targetX + size > placement.x &&
					context.targetY < placement.y + existingSize &&
					context.targetY + size > placement.y
				) {
					return {
						isValid: false,
						reason: `Overlaps with existing ${existingItem.displayName}`,
					}
				}
			}

			return { isValid: true }
		}
	},

	/**
	 * Rule: Cannot exceed specified zone density
	 */
	maxDensity(maxDensityPercentage = 0.8): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			if (
				context.operationType !== 'item-add-to-zone' &&
				context.operationType !== 'item-clone-in-zone' &&
				context.operationType !== 'item-move-across-zones'
			) {
				return { isValid: true }
			}

			const targetZone = context.targetZone

			const plantItem = context.item
			const itemFootprint = (plantItem.metadata.plantingDistanceInFeet || 1) ** 2

			// Calculate current occupied space
			let occupiedSpace = 0
			for (const placement of targetZone.placements) {
				// Skip the item itself in case of a move within same zone
				if (
					context.itemInstanceId &&
					placement.id === context.itemInstanceId &&
					context.sourceZone &&
					context.targetZone.id === context.sourceZone.id
				) {
					continue
				}

				const existingItem = placement.item as Item<PlantMetadata>
				const existingFootprint = (existingItem.metadata.plantingDistanceInFeet || 1) ** 2
				occupiedSpace += existingFootprint
			}

			// Add the new item's footprint
			const totalOccupiedAfterAdd = occupiedSpace + itemFootprint
			const totalSpace = targetZone.width * targetZone.height
			const occupancyRate = totalOccupiedAfterAdd / totalSpace

			if (occupancyRate > maxDensityPercentage) {
				return {
					isValid: false,
					reason: `Zone is too crowded (${Math.round(occupancyRate * 100)}% occupied)`,
				}
			}

			return { isValid: true }
		}
	},

	/**
	 * Rule: Specific plant types have sunlight requirements
	 */
	sunlightRequirements(): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			const targetZone = context.targetZone

			const plantItem = context.item

			// Example sunlight requirements by plant family
			if (plantItem.metadata.family === 'tomatoes' && targetZone.sunLevel < 3) {
				return {
					isValid: false,
					reason: 'Tomatoes require high sunlight levels (minimum 3)',
				}
			}

			// More plant-specific rules can be added here

			return { isValid: true }
		}
	},

	/**
	 * Rule: Prohibit specific plant types in specific zones
	 */
	restrictedPlantsByZone(
		restrictions: { plantType: string; zoneIds: string[] }[],
	): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			const plantItem = context.item
			const targetZone = context.targetZone

			for (const restriction of restrictions) {
				if (
					plantItem.metadata.family === restriction.plantType &&
					restriction.zoneIds.includes(targetZone.id)
				) {
					return {
						isValid: false,
						reason: `${plantItem.displayName} cannot be placed in this zone`,
					}
				}
			}

			return { isValid: true }
		}
	},

	/**
	 * Rule: Certain plants should not be placed adjacent to each other
	 */
	incompatiblePlants(
		incompatibilities: { plant1: string; plant2: string; reason: string }[],
	): ValidationRule<Item<PlantMetadata>> {
		return (context) => {
			if (context.targetX === undefined || context.targetY === undefined) {
				return { isValid: false, reason: 'Missing target coordinates' }
			}

			const targetZone = context.targetZone

			const plantItem = context.item
			const plantSize = plantItem.metadata.plantingDistanceInFeet || 1

			// Define the margin to check for adjacency (could be customizable)
			const adjacencyMargin = 0.5

			for (const placement of targetZone.placements) {
				// Skip the item itself in case of a move
				if (context.itemInstanceId && placement.id === context.itemInstanceId) {
					continue
				}

				const existingItem = placement.item as Item<PlantMetadata>
				const existingSize = existingItem.metadata.plantingDistanceInFeet || 1

				// Check if the items are adjacent (within the margin)
				const isAdjacent =
					Math.abs(context.targetX - placement.x) <=
						plantSize + existingSize + adjacencyMargin &&
					Math.abs(context.targetY - placement.y) <=
						plantSize + existingSize + adjacencyMargin

				if (isAdjacent) {
					// Check for incompatibilities
					for (const incompatibility of incompatibilities) {
						const isIncompatible =
							(plantItem.metadata.family === incompatibility.plant1 &&
								existingItem.metadata.family === incompatibility.plant2) ||
							(plantItem.metadata.family === incompatibility.plant2 &&
								existingItem.metadata.family === incompatibility.plant1)

						if (isIncompatible) {
							return {
								isValid: false,
								reason: incompatibility.reason,
							}
						}
					}
				}
			}

			return { isValid: true }
		}
	},
}
