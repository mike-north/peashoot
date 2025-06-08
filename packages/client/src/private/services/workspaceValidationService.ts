import { type PlantMetadata } from '../../lib/entities/plant-metadata'
import type { Zone } from '../../lib/entities/zone'
import type {
	WorkspaceAsyncValidationFunction,
	WorkspaceValidationContext,
} from '../state/workspaceDragState'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../dnd/constants'
import { UnreachableError } from '../../lib/errors/unreachabe'
import type { GridPlacement } from '../grid/grid-placement'
import type { Item } from '../../lib/entities/item'
import type { ValidationResult } from '../../lib/types/validation'

interface PlacementValidityResult {
	isValid: boolean
	reason?: string
}

export class WorkspaceValidationService {
	constructor(private readonly items: Item<PlantMetadata>[]) {}

	private calculateOccupancy(
		zone: Zone,
		newItemFootprint: number,
	): {
		currentOccupiedCells: number
		totalOccupiedAfterAdd: number
		occupancyRateAfterAdd: number
	} {
		const currentOccupiedCells = zone.placements.reduce(
			(total: number, placement: GridPlacement<Item>) => {
				const existingItem = this.items.find((p) => p.id === placement.item.id)
				if (!existingItem) {
					throw new Error(`Item not found for validation: ${placement.item.id}`)
				}
				return total + existingItem.size ** 2
			},
			0,
		)

		const totalOccupiedAfterAdd = currentOccupiedCells + newItemFootprint
		const totalCells = zone.width * zone.height
		const occupancyRateAfterAdd = totalOccupiedAfterAdd / totalCells

		return { currentOccupiedCells, totalOccupiedAfterAdd, occupancyRateAfterAdd }
	}

	private checkPlacementValidity(
		targetZone: Zone,
		itemX: number,
		itemY: number,
		itemSize: number,
		excludeItemId?: string,
	): PlacementValidityResult {
		// Check bounds
		if (
			itemX < 0 ||
			itemY < 0 ||
			itemX + itemSize > targetZone.width ||
			itemY + itemSize > targetZone.height
		) {
			return { isValid: false, reason: 'Placement is out of bounds.' }
		}

		// Check collisions with existing items
		for (const existingItem of targetZone.placements) {
			if (excludeItemId && existingItem.id === excludeItemId) {
				continue
			}

			// Get the item data to find its size
			const existingItemData = this.items.find((p) => p.id === existingItem.item.id)
			const existingSize = existingItemData ? existingItemData.size : 1

			if (
				itemX < existingItem.x + existingSize &&
				itemX + itemSize > existingItem.x &&
				itemY < existingItem.y + existingSize &&
				itemY + itemSize > existingItem.y
			) {
				const itemName = existingItemData ? existingItemData.displayName : 'Unknown item'
				return {
					isValid: false,
					reason: `Overlaps with existing item '${itemName}' (ID: ${existingItem.id}).`,
				}
			}
		}
		return { isValid: true }
	}

	createAsyncValidator(): WorkspaceAsyncValidationFunction<Item> {
		return async (
			context: WorkspaceValidationContext<Item>,
		): Promise<ValidationResult> => {
			await new Promise((resolve) => setTimeout(resolve, ASYNC_VALIDATION_TIMEOUT_MS))

			if (!context.applicationContext) {
				throw new Error('Workspace application context not provided in validation')
			}

			const currentWorkspace = context.applicationContext.workspace

			return new Promise<ValidationResult>((resolve, reject) => {
				setTimeout(() => {
					try {
						const item = context.item
						// For now, assume all items are plants (this can be extended with item adapters)
						const plant = item as Item<PlantMetadata>

						switch (context.operationType) {
							case 'item-move-within-zone':
								// TODO: Implement real validation logic for moving an item within a zone
								resolve({ isValid: true })
								break
							case 'item-move-across-zones': {
								const targetZone = currentWorkspace.zones.find(
									(z: Zone) => z.id === context.targetZoneId,
								)
								const sourceZone = currentWorkspace.zones.find(
									(z: Zone) => z.id === context.sourceZoneId,
								)
								if (!targetZone || !sourceZone) {
									reject(new Error('Zone not found for cross-zone move'))
									return
								}
								if (
									context.targetX === undefined ||
									context.targetY === undefined ||
									plant.metadata.plantingDistanceInFeet <= 0
								) {
									reject(
										new Error(
											'Missing target coordinates or item size for collision check.',
										),
									)
									return
								}
								const placementCheck = this.checkPlacementValidity(
									targetZone,
									context.targetX,
									context.targetY,
									plant.metadata.plantingDistanceInFeet,
									context.itemInstanceId,
								)
								if (!placementCheck.isValid) {
									reject(new Error(`Cannot move item: ${placementCheck.reason}`))
									return
								}
								// TODO: Implement real environment compatibility checks
								if (plant.metadata.family === 'tomatoes' && targetZone.sunLevel < 3) {
									resolve({
										isValid: false,
										reason: 'Target zone has insufficient sunlight for tomatoes',
									})
								} else if (Math.random() > 0.1) resolve({ isValid: true })
								else
									resolve({
										isValid: false,
										reason: 'Environment compatibility issue between zones',
									})
								break
							}

							case 'item-add-to-zone': {
								const addTargetZone = currentWorkspace.zones.find(
									(z: Zone) => z.id === context.targetZoneId,
								)
								if (!addTargetZone) {
									reject(new Error('Target zone not found for add operation'))
									return
								}

								const newItemFootprint = plant.metadata.plantingDistanceInFeet ** 2
								const { occupancyRateAfterAdd } = this.calculateOccupancy(
									addTargetZone,
									newItemFootprint,
								)

								if (occupancyRateAfterAdd > 0.8) {
									resolve({ isValid: false, reason: 'Zone is too crowded for new items' })
								} else {
									// TODO: Implement real checks for item suitability in the zone
									resolve({ isValid: true })
								}
								break
							}

							case 'item-remove-from-zone': {
								// TODO: Implement real checks for removal, e.g., considering dependencies
								resolve({ isValid: true })
								break
							}

							case 'item-clone-in-zone': {
								const cloneTargetZone = currentWorkspace.zones.find(
									(z: Zone) => z.id === context.targetZoneId,
								)
								if (!cloneTargetZone) {
									reject(new Error('Target zone not found for clone operation'))
									return
								}
								if (
									context.targetX === undefined ||
									context.targetY === undefined ||
									plant.metadata.plantingDistanceInFeet <= 0
								) {
									reject(
										new Error(
											'Missing target coordinates or item size for clone collision check.',
										),
									)
									return
								}
								const clonePlacementCheck = this.checkPlacementValidity(
									cloneTargetZone,
									context.targetX,
									context.targetY,
									plant.metadata.plantingDistanceInFeet,
									context.itemInstanceId,
								)
								if (!clonePlacementCheck.isValid) {
									resolve({
										isValid: false,
										reason: `Cannot clone item: ${clonePlacementCheck.reason}`,
									})
									return
								}

								const newCloneFootprint = plant.metadata.plantingDistanceInFeet ** 2
								const { occupancyRateAfterAdd: occupancyRateAfterClone } =
									this.calculateOccupancy(cloneTargetZone, newCloneFootprint)

								if (occupancyRateAfterClone > 0.75) {
									resolve({
										isValid: false,
										reason: 'Target zone is too crowded for cloning (capacity check)',
									})
								} else {
									// TODO: Implement real checks for cloning suitability
									resolve({ isValid: true })
								}
								break
							}

							default:
								console.warn(
									'[WorkspaceValidationService] Unknown operationType in context:',
									context.operationType,
								)
								reject(
									new UnreachableError(context.operationType, `Unknown operation type`),
								)
						}
					} catch (error: unknown) {
						if (error instanceof Error) {
							reject(error)
						} else {
							reject(new Error(`Unknown error: ${String(error)}`))
						}
					}
				}, 200)
			})
		}
	}
}
