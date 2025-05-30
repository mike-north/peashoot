import type { GardenBed } from '../garden-bed'
import type { PlantPlacement } from '../plant-placement'
import type {
	GardenAsyncValidationFunction,
	GardenValidationContext,
	ValidationResult,
} from '../../private-ui/state/gardenDragState'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../dnd/constants'
import { UnreachableError } from '../../errors/unreachabe'
import type { Plant } from '../plant'

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
		const plant = this.plants.find((p) => p.id === excludeItemId)
		if (!plant) {
			return { isValid: false, reason: 'Plant not found.' }
		}

		// Check bounds
		if (
			itemX < 0 ||
			itemY < 0 ||
			itemX + itemSize > targetBed.width ||
			itemY + itemSize > targetBed.height
		) {
			return { isValid: false, reason: 'Placement is out of bounds.' }
		}

		// Check collisions
		for (const existingPlant of targetBed.plantPlacements) {
			if (excludeItemId && existingPlant.id === excludeItemId) {
				continue
			}
			const existingSize = plant.plantingDistanceInFeet
			if (
				itemX < existingPlant.x + existingSize &&
				itemX + itemSize > existingPlant.x &&
				itemY < existingPlant.y + existingSize &&
				itemY + itemSize > existingPlant.y
			) {
				return {
					isValid: false,
					reason: `Overlaps with existing plant '${plant.displayName}' (ID: ${existingPlant.id}).`,
				}
			}
		}
		return { isValid: true }
	}

	createAsyncValidator(): GardenAsyncValidationFunction {
		return async (context: GardenValidationContext): Promise<ValidationResult> => {
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
									Math.random() > 0.02
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
									reject(new Error('Target bed has insufficient sunlight for tomatoes'))
								} else if (Math.random() > 0.1) resolve({ isValid: true })
								else reject(new Error('Soil compatibility issue between beds'))
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
								const occupiedCells = addTargetBed.plantPlacements.reduce(
									(total: number) => {
										return total + plant.plantingDistanceInFeet ** 2
									},
									0,
								)
								const totalCells = addTargetBed.width * addTargetBed.height
								const occupancyRate = occupiedCells / totalCells
								if (occupancyRate > 0.8)
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
									(edge) =>
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
									reject(new Error(`Cannot clone plant: ${clonePlacementCheck.reason}`))
									return
								}

								const occupiedCells = cloneTargetBed.plantPlacements.reduce(
									(total: number, placement: PlantPlacement) => {
										const plant = this.plants.find((p) => p.id === placement.plantId)
										if (!plant) {
											throw new Error('Plant not found for validation')
										}
										return total + plant.plantingDistanceInFeet ** 2
									},
									0,
								)
								const totalCells = cloneTargetBed.width * cloneTargetBed.height
								const occupancyRate = occupiedCells / totalCells
								if (occupancyRate > 0.75)
									reject(
										new Error('Target bed is too crowded for cloning (capacity check)'),
									)
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
