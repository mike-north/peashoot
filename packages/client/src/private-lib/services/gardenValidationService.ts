import type { Plant } from '../../lib/entities/plant'
import type { GardenBed, PlantWithSize } from '../../lib/entities/garden-bed'
import type {
	GardenAsyncValidationFunction,
	GardenValidationContext,
} from '../../private-ui/state/gardenDragState'
import type { ValidationResult } from '../../private/grid/grid-drag-state'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../../private/dnd/constants'
import { UnreachableError } from '../../lib/errors/unreachabe'
import type { GridPlacement } from '../../private/grid/grid-placement'

interface PlacementValidityResult {
	isValid: boolean
	reason?: string
}

export class GardenValidationService {
	constructor(private readonly plants: Plant[]) {}

	private checkPlacementValidity(
		targetBed: GardenBed,
		itemX: number,
		itemY: number,
		itemSize: number,
		excludeItemId?: string,
	): PlacementValidityResult {
		// Check bounds
		if (
			itemX < 0 ||
			itemY < 0 ||
			itemX + itemSize > targetBed.width ||
			itemY + itemSize > targetBed.height
		) {
			return { isValid: false, reason: 'Placement is out of bounds.' }
		}

		// Check collisions with existing plants
		for (const existingPlant of targetBed.placements) {
			if (excludeItemId && existingPlant.id === excludeItemId) {
				continue
			}

			// Get the plant data to find its size
			const existingPlantData = this.plants.find((p) => p.id === existingPlant.item.id)
			const existingSize = existingPlantData
				? existingPlantData.plantingDistanceInFeet
				: 1

			if (
				itemX < existingPlant.x + existingSize &&
				itemX + itemSize > existingPlant.x &&
				itemY < existingPlant.y + existingSize &&
				itemY + itemSize > existingPlant.y
			) {
				const plantName = existingPlantData
					? existingPlantData.displayName
					: 'Unknown plant'
				return {
					isValid: false,
					reason: `Overlaps with existing plant '${plantName}' (ID: ${existingPlant.id}).`,
				}
			}
		}
		return { isValid: true }
	}

	createAsyncValidator(): GardenAsyncValidationFunction<PlantWithSize> {
		return async (
			context: GardenValidationContext<PlantWithSize>,
		): Promise<ValidationResult> => {
			await new Promise((resolve) => setTimeout(resolve, ASYNC_VALIDATION_TIMEOUT_MS))

			if (!context.applicationContext) {
				throw new Error('Garden application context not provided in validation')
			}

			const currentGarden = context.applicationContext.garden

			return new Promise<ValidationResult>((resolve, reject) => {
				setTimeout(() => {
					try {
						const plant = context.item
						switch (context.operationType) {
							case 'item-move-within-zone':
								resolve(
									Math.random() > 0.3
										? { isValid: true }
										: {
												isValid: false,
												error: 'Plant is too established to move within bed',
											},
								)
								break
							case 'item-move-across-zones': {
								const targetBed = currentGarden.beds.find(
									(b: GardenBed) => b.id === context.targetZoneId,
								)
								const sourceBed = currentGarden.beds.find(
									(b: GardenBed) => b.id === context.sourceZoneId,
								)
								if (!targetBed || !sourceBed) {
									reject(new Error('Bed not found for cross-zone move'))
									return
								}
								if (
									context.targetX === undefined ||
									context.targetY === undefined ||
									plant.plantingDistanceInFeet <= 0
								) {
									reject(
										new Error(
											'Missing target coordinates or item size for collision check.',
										),
									)
									return
								}
								const placementCheck = this.checkPlacementValidity(
									targetBed,
									context.targetX,
									context.targetY,
									plant.plantingDistanceInFeet,
									context.itemInstanceId,
								)
								if (!placementCheck.isValid) {
									reject(new Error(`Cannot move plant: ${placementCheck.reason}`))
									return
								}
								if (plant.family === 'tomatoes' && targetBed.sunLevel < 3) {
									resolve({
										isValid: false,
										error: 'Target bed has insufficient sunlight for tomatoes',
									})
								} else if (Math.random() > 0.1) resolve({ isValid: true })
								else
									resolve({
										isValid: false,
										error: 'Soil compatibility issue between beds',
									})
								break
							}

							case 'item-add-to-zone': {
								const plant = context.item
								const addTargetBed = currentGarden.beds.find(
									(b: GardenBed) => b.id === context.targetZoneId,
								)
								if (!addTargetBed) {
									reject(new Error('Target bed not found for add operation'))
									return
								}

								// Calculate current occupancy correctly
								const currentOccupiedCells = addTargetBed.placements.reduce(
									(total: number, placement: GridPlacement<PlantWithSize>) => {
										const existingPlant = this.plants.find(
											(p) => p.id === placement.item.id,
										)
										if (!existingPlant) {
											throw new Error(
												`Plant not found for validation: ${placement.item.id}`,
											)
										}
										// Use the existing plant's size, not the new plant's size
										return total + existingPlant.plantingDistanceInFeet ** 2
									},
									0,
								)

								// Add the footprint of the plant being added
								const newPlantFootprint = plant.plantingDistanceInFeet ** 2
								const totalOccupiedAfterAdd = currentOccupiedCells + newPlantFootprint

								const totalCells = addTargetBed.width * addTargetBed.height
								const occupancyRateAfterAdd = totalOccupiedAfterAdd / totalCells

								if (occupancyRateAfterAdd > 0.8)
									resolve({ isValid: false, error: 'Bed is too crowded for new plants' })
								else if (Math.random() > 0.05) resolve({ isValid: true })
								else
									resolve({
										isValid: false,
										error: 'Current season not suitable for this plant',
									})
								break
							}

							case 'item-remove-from-zone': {
								const hasEdgeIndicators = currentGarden.edgeIndicators.some(
									(edge: { plantAId: string; plantBId: string }) =>
										edge.plantAId === context.itemInstanceId ||
										edge.plantBId === context.itemInstanceId,
								)
								if (hasEdgeIndicators && Math.random() > 0.7)
									resolve({
										isValid: false,
										error: 'Plant has beneficial relationships with neighbors',
									})
								else resolve({ isValid: true })
								break
							}

							case 'item-clone-in-zone': {
								const cloneTargetBed = currentGarden.beds.find(
									(b: GardenBed) => b.id === context.targetZoneId,
								)
								if (!cloneTargetBed) {
									reject(new Error('Target bed not found for clone operation'))
									return
								}
								if (
									context.targetX === undefined ||
									context.targetY === undefined ||
									context.item.plantingDistanceInFeet <= 0
								) {
									reject(
										new Error(
											'Missing target coordinates or item size for clone collision check.',
										),
									)
									return
								}
								const clonePlacementCheck = this.checkPlacementValidity(
									cloneTargetBed,
									context.targetX,
									context.targetY,
									plant.plantingDistanceInFeet,
								)
								if (!clonePlacementCheck.isValid) {
									resolve({
										isValid: false,
										error: `Cannot clone plant: ${clonePlacementCheck.reason}`,
									})
									return
								}

								// Calculate current occupancy AND include the plant being cloned
								const currentOccupiedCells = cloneTargetBed.placements.reduce(
									(total: number, placement: GridPlacement<PlantWithSize>) => {
										const existingPlant = this.plants.find(
											(p) => p.id === placement.item.id,
										)
										if (!existingPlant) {
											throw new Error(
												`Plant not found for validation: ${placement.item.id}`,
											)
										}
										// Use the existing plant's size, not the new plant's size
										return total + existingPlant.plantingDistanceInFeet ** 2
									},
									0,
								)

								// Add the footprint of the plant being cloned
								const newPlantFootprint = plant.plantingDistanceInFeet ** 2
								const totalOccupiedAfterClone = currentOccupiedCells + newPlantFootprint

								const totalCells = cloneTargetBed.width * cloneTargetBed.height
								const occupancyRateAfterClone = totalOccupiedAfterClone / totalCells

								if (occupancyRateAfterClone > 0.75)
									resolve({
										isValid: false,
										error: 'Target bed is too crowded for cloning (capacity check)',
									})
								else
									resolve(
										Math.random() > 0.12
											? { isValid: true }
											: {
													isValid: false,
													error:
														'Plant genetics not stable enough for cloning (random check)',
												},
									)
								break
							}

							default:
								console.warn(
									'[GardenValidationService] Unknown operationType in context:',
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
