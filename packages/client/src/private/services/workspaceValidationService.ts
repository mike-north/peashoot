import type { PlantItem } from '../../lib/item-types/plant-item'
import { getPlantProperties } from '../../lib/item-types/plant-item'
import type { Zone, ItemWithSize } from '../../lib/entities/zone'
import type {
	WorkspaceAsyncValidationFunction,
	WorkspaceValidationContext,
} from '../state/workspaceDragState'
import type { ValidationResult } from '../grid/grid-drag-state'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../dnd/constants'
import { UnreachableError } from '../../lib/errors/unreachabe'
import type { GridPlacement } from '../grid/grid-placement'

interface PlacementValidityResult {
	isValid: boolean
	reason?: string
}

export class WorkspaceValidationService {
	constructor(private readonly items: PlantItem[]) {}

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
			console.debug('Placement is out of bounds.', {
				itemX,
				itemY,
				itemSize,
				targetZone,
				excludeItemId,
			})
			return { isValid: false, reason: 'Placement is out of bounds.' }
		}

		// Check collisions with existing items
		for (const existingItem of targetZone.placements) {
			if (excludeItemId && existingItem.id === excludeItemId) {
				continue
			}

			// Get the item data to find its size
			const existingItemData = this.items.find((p) => p.id === existingItem.item.id)
			const existingSize = existingItemData
				? existingItemData.metadata.plantingDistanceInFeet
				: 1

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

	createAsyncValidator(): WorkspaceAsyncValidationFunction<ItemWithSize> {
		return async (
			context: WorkspaceValidationContext<ItemWithSize>,
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
						const plant = item as PlantItem
						const plantProps = getPlantProperties(plant)

						switch (context.operationType) {
							case 'item-move-within-zone':
								resolve(
									Math.random() > 0.3
										? { isValid: true }
										: {
												isValid: false,
												error: 'Item is too established to move within zone',
											},
								)
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
									plantProps.plantingDistanceInFeet <= 0
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
									plantProps.plantingDistanceInFeet,
									context.itemInstanceId,
								)
								if (!placementCheck.isValid) {
									reject(new Error(`Cannot move item: ${placementCheck.reason}`))
									return
								}
								if (plantProps.family === 'tomatoes' && targetZone.sunLevel < 3) {
									resolve({
										isValid: false,
										error: 'Target zone has insufficient sunlight for tomatoes',
									})
								} else if (Math.random() > 0.1) resolve({ isValid: true })
								else
									resolve({
										isValid: false,
										error: 'Environment compatibility issue between zones',
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

								// Calculate current occupancy correctly
								const currentOccupiedCells = addTargetZone.placements.reduce(
									(total: number, placement: GridPlacement<ItemWithSize>) => {
										const existingItem = this.items.find(
											(p) => p.id === placement.item.id,
										)
										if (!existingItem) {
											throw new Error(
												`Item not found for validation: ${placement.item.id}`,
											)
										}
										// Use the existing item's size, not the new item's size
										const existingProps = getPlantProperties(existingItem)
										return total + existingProps.plantingDistanceInFeet ** 2
									},
									0,
								)

								// Add the footprint of the item being added
								const newItemFootprint = plantProps.plantingDistanceInFeet ** 2
								const totalOccupiedAfterAdd = currentOccupiedCells + newItemFootprint

								const totalCells = addTargetZone.width * addTargetZone.height
								const occupancyRateAfterAdd = totalOccupiedAfterAdd / totalCells

								if (occupancyRateAfterAdd > 0.8)
									resolve({ isValid: false, error: 'Zone is too crowded for new items' })
								else if (Math.random() > 0.05) resolve({ isValid: true })
								else
									resolve({
										isValid: false,
										error: 'Current conditions not suitable for this item',
									})
								break
							}

							case 'item-remove-from-zone': {
								const hasEdgeIndicators = currentWorkspace.edgeIndicators.some(
									(edge: { itemAId: string; itemBId: string }) =>
										edge.itemAId === context.itemInstanceId ||
										edge.itemBId === context.itemInstanceId,
								)
								if (hasEdgeIndicators && Math.random() > 0.7)
									resolve({
										isValid: false,
										error: 'Item has beneficial relationships with neighbors',
									})
								else resolve({ isValid: true })
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
									plantProps.plantingDistanceInFeet <= 0
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
									plantProps.plantingDistanceInFeet,
								)
								if (!clonePlacementCheck.isValid) {
									resolve({
										isValid: false,
										error: `Cannot clone item: ${clonePlacementCheck.reason}`,
									})
									return
								}

								// Calculate current occupancy AND include the item being cloned
								const currentOccupiedCells = cloneTargetZone.placements.reduce(
									(total: number, placement: GridPlacement<ItemWithSize>) => {
										const existingItem = this.items.find(
											(p) => p.id === placement.item.id,
										)
										if (!existingItem) {
											throw new Error(
												`Item not found for validation: ${placement.item.id}`,
											)
										}
										// Use the existing item's size, not the new item's size
										const existingProps = getPlantProperties(existingItem)
										return total + existingProps.plantingDistanceInFeet ** 2
									},
									0,
								)

								// Add the footprint of the item being cloned
								const newItemFootprint = plantProps.plantingDistanceInFeet ** 2
								const totalOccupiedAfterClone = currentOccupiedCells + newItemFootprint

								const totalCells = cloneTargetZone.width * cloneTargetZone.height
								const occupancyRateAfterClone = totalOccupiedAfterClone / totalCells

								if (occupancyRateAfterClone > 0.75)
									resolve({
										isValid: false,
										error: 'Target zone is too crowded for cloning (capacity check)',
									})
								else
									resolve(
										Math.random() > 0.12
											? { isValid: true }
											: {
													isValid: false,
													error:
														'Item properties not stable enough for cloning (random check)',
												},
									)
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
