<script lang="ts">
import GardenView from '../components/GardenView.svelte'
import type { GardenBed } from '../../private-lib/garden-bed'
import { updatePlantPositionInBed } from '../../private-lib/garden-bed'
import type { Plant } from '../../private-lib/plant'
import type { Garden } from '../../private-lib/garden'
import {
	movePlantBetweenBeds,
	findBed,
	findPlantPlacement,
} from '../../private-lib/garden'
import PageTitle from '../components/PageTitle.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import {
	type ExistingGardenItem,
	type GardenValidationContext,
	type GardenAsyncValidationFunction,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
	type GardenZoneContext,
	type ValidationResult,
} from '../state/gardenDragState'
import { UnreachableError } from '../../lib/errors/unreachabe'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../../private-lib/dnd/constants'
import { GardenAdapter } from '../../lib/adapters/garden-adapter'
import { onMount } from 'svelte'
import { plants } from '../state/plantsStore'
import type { GridPlacement } from '../../private-lib/grid-placement'
import type { PlantWithSize } from '../../private-lib/garden-bed'

const { route }: { route: RouteResult } = $props()

let gardenInstance: Garden | undefined = $state<Garden | undefined>(undefined)

let isAsyncValidating = $state<boolean>(false)
let validationError = $state<string | null>(null)

const gardenAdapter = new GardenAdapter()

onMount(() => {
	gardenAdapter
		.fetchGardens()
		.then((gardens) => {
			gardenInstance = gardens[0]
		})
		.catch((err: unknown) => {
			console.error('Error fetching gardens', { cause: err })
		})
})

function handleAsyncValidationStart() {
	isAsyncValidating = true
	validationError = null
}

function handleAsyncValidationSuccess() {
	isAsyncValidating = false
	validationError = null
}

function handleAsyncValidationError(errorMessage: string) {
	isAsyncValidating = false
	validationError = errorMessage
	setTimeout(() => {
		validationError = null
	}, 7000) // Clear error after 7 seconds
}

function handleMovePlantInBed(
	bedId: string,
	plantId: string,
	newX: number,
	newY: number,
) {
	if (!gardenInstance) return
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId ? updatePlantPositionInBed(b, plantId, newX, newY) : b,
		)
	} else {
		console.error('[App.svelte] Bed not found for movePlantInBed:', bedId)
	}
}

function handleMovePlantToDifferentBed(
	sourceBedId: string,
	targetBedId: string,
	existingItem: ExistingGardenItem<PlantWithSize>,
	newX: number,
	newY: number,
) {
	// Inline conversion from ExistingGardenItem<PlantWithSize> to GridPlacement<PlantWithSize>
	const gridPlacementArg: GridPlacement<PlantWithSize> = {
		id: existingItem.id,
		x: existingItem.x,
		y: existingItem.y,
		size: existingItem.itemData.size,
		data: existingItem.itemData,
	}
	if (!gardenInstance) return
	gardenInstance = movePlantBetweenBeds(
		gardenInstance,
		sourceBedId,
		targetBedId,
		gridPlacementArg,
		newX,
		newY,
	)
}

function handleAddNewPlant(bedId: string, item: Plant, x: number, y: number) {
	if (!gardenInstance) return
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		const newPlantId = `${item.family}_${Date.now()}`

		const newPlacement: GridPlacement<PlantWithSize> = {
			id: newPlantId,
			x,
			y,
			size: item.presentation.size,
			data: { ...item, size: item.presentation.size },
		}

		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId
				? { ...b, plantPlacements: [...b.plantPlacements, newPlacement] }
				: b,
		)

		console.log(`[Garden] Added new ${item.displayName} to bed ${bedId} at (${x}, ${y})`)
	} else {
		console.error('[Garden] Bed not found for addNewPlant:', bedId)
	}
}

function handleDeletePlant(plantId: string, bedId: string) {
	if (!gardenInstance) return
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId
				? { ...b, plantPlacements: b.plantPlacements.filter((p) => p.id !== plantId) }
				: b,
		)

		console.log(`[Garden] Deleted plant ${plantId} from bed ${bedId}`)
	} else {
		console.error('[Garden] Bed not found for deletePlant:', bedId)
	}
}

function buildGardenZoneContext(
	bed: GardenBed | undefined,
): GardenZoneContext<PlantWithSize> | undefined {
	if (!bed) return undefined
	return {
		...bed,
		placements: bed.plantPlacements.map((placement) => {
			// placement is already GridPlacement<PlantWithSize>
			return placement
		}),
	} as GardenZoneContext<PlantWithSize>
}

async function handleRequestPlacement(
	details: PlacementRequestDetails<PlantWithSize>,
): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const targetBed = findBed(gardenInstance, details.targetZoneId)
	const sourceBed = details.sourceZoneId
		? findBed(gardenInstance, details.sourceZoneId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext<PlantWithSize>> = {
		item: details.itemData,
		targetZoneId: details.targetZoneId,
		targetX: details.x,
		targetY: details.y,
		operationType: details.operationType,
		applicationContext: { garden: gardenInstance },
	}

	const targetCtx = buildGardenZoneContext(targetBed)
	if (targetCtx) baseValidationContext.targetZoneContext = targetCtx
	if (details.originalInstanceId)
		baseValidationContext.itemInstanceId = details.originalInstanceId
	if (details.sourceZoneId) baseValidationContext.sourceZoneId = details.sourceZoneId
	const sourceCtx = buildGardenZoneContext(sourceBed)
	if (sourceCtx) baseValidationContext.sourceZoneContext = sourceCtx

	if (details.originalInstanceId && sourceBed) {
		const originalPlantPlacement = findPlantPlacement(
			sourceBed,
			details.originalInstanceId,
		)
		if (originalPlantPlacement) {
			baseValidationContext.sourceX = originalPlantPlacement.x
			baseValidationContext.sourceY = originalPlantPlacement.y
		}
	}

	const validationContext =
		baseValidationContext as GardenValidationContext<PlantWithSize>

	try {
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Successful validation - operation can proceed
			return
		} else {
			// Successful validation request, but business logic failure (like HTTP 200 with isValid=false)
			// Show user feedback AND throw error to prevent operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			throw new Error(result.error || 'Validation failed')
		}
	} catch (error) {
		// Check if it's our thrown validation failure or a system error
		if (error instanceof Error && error.message.includes('Validation failed')) {
			// This is our thrown validation failure - just re-throw to prevent operation
			throw error
		}
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		// This indicates the validation system itself failed, not just business logic failure
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during placement request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

async function handleRequestRemoval(
	details: RemovalRequestDetails<PlantWithSize>,
): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const sourceBed = findBed(gardenInstance, details.sourceZoneId)
	const plantToRemove = sourceBed
		? findPlantPlacement(sourceBed, details.instanceId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext<PlantWithSize>> = {
		operationType: 'item-remove-from-zone',
		item: details.itemData,
		itemInstanceId: details.instanceId,
		sourceZoneId: details.sourceZoneId,
		applicationContext: { garden: gardenInstance },
	}
	const remSourceCtx = buildGardenZoneContext(sourceBed)
	if (remSourceCtx) baseValidationContext.sourceZoneContext = remSourceCtx
	if (plantToRemove) {
		baseValidationContext.sourceX = plantToRemove.x
		baseValidationContext.sourceY = plantToRemove.y
	}

	const validationContext =
		baseValidationContext as GardenValidationContext<PlantWithSize>

	try {
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Successful validation - operation can proceed
			return
		} else {
			// Successful validation request, but business logic failure (like HTTP 200 with isValid=false)
			// Show user feedback AND throw error to prevent operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			throw new Error(result.error || 'Validation failed')
		}
	} catch (error) {
		// Check if it's our thrown validation failure or a system error
		if (error instanceof Error && error.message.includes('Validation failed')) {
			// This is our thrown validation failure - just re-throw to prevent operation
			throw error
		}
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		// This indicates the validation system itself failed, not just business logic failure
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during removal request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

async function handleRequestCloning(
	details: CloningRequestDetails<PlantWithSize>,
): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const sourceBed = findBed(gardenInstance, details.sourceOriginalZoneId)
	const targetBed = findBed(gardenInstance, details.targetCloneZoneId)

	const baseValidationContext: Partial<GardenValidationContext<PlantWithSize>> = {
		operationType: 'item-clone-in-zone',
		item: details.itemDataToClone,
		sourceZoneId: details.sourceOriginalZoneId,
		targetZoneId: details.targetCloneZoneId,
		sourceX: details.sourceOriginalX,
		sourceY: details.sourceOriginalY,
		targetX: details.targetCloneX,
		targetY: details.targetCloneY,
		applicationContext: { garden: gardenInstance },
	}
	const cloneSourceCtx = buildGardenZoneContext(sourceBed)
	if (cloneSourceCtx) baseValidationContext.sourceZoneContext = cloneSourceCtx
	const cloneTargetCtx = buildGardenZoneContext(targetBed)
	if (cloneTargetCtx) baseValidationContext.targetZoneContext = cloneTargetCtx

	const validationContext =
		baseValidationContext as GardenValidationContext<PlantWithSize>

	try {
		const result = await customAsyncValidation(validationContext)
		if (result.isValid) {
			handleAsyncValidationSuccess()
			// Successful validation - operation can proceed
			return
		} else {
			// Successful validation request, but business logic failure (like HTTP 200 with isValid=false)
			// Show user feedback AND throw error to prevent operation
			handleAsyncValidationError(result.error || 'Unknown validation error')
			throw new Error(result.error || 'Validation failed')
		}
	} catch (error) {
		// Check if it's our thrown validation failure or a system error
		if (error instanceof Error && error.message.includes('Validation failed')) {
			// This is our thrown validation failure - just re-throw to prevent operation
			throw error
		}
		// Validation system failure (like HTTP 4xx/5xx) - unexpected infrastructure/system error
		// This indicates the validation system itself failed, not just business logic failure
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(
			'[GardenPage] Validation system failure during cloning request:',
			errorMessage,
			error,
		)
		handleAsyncValidationError(`Validation system error: ${errorMessage}`)
		throw error // Re-throw system errors so calling code knows validation system failed
	}
}

const customAsyncValidation: GardenAsyncValidationFunction<PlantWithSize> = async (
	context: GardenValidationContext<PlantWithSize>,
): Promise<ValidationResult> => {
	await new Promise((resolve) => setTimeout(resolve, ASYNC_VALIDATION_TIMEOUT_MS))
	if (!context.applicationContext) {
		// System error: reject the promise
		return Promise.reject(
			new Error('Garden application context not provided in validation'),
		)
	}
	const currentGarden = context.applicationContext.garden

	// Get plants data synchronously to avoid reactive store issues in async context
	const plantsData = $plants

	const checkPlacementValidity = (
		targetBed: GardenBed,
		itemX: number,
		itemY: number,
		itemSize: number,
		excludeItemId?: string,
	): { isValid: boolean; reason?: string } => {
		if (
			itemX < 0 ||
			itemY < 0 ||
			itemX + itemSize > targetBed.width ||
			itemY + itemSize > targetBed.height
		) {
			return { isValid: false, reason: 'Placement is out of bounds.' }
		}
		for (const existingPlant of targetBed.plantPlacements) {
			if (excludeItemId && existingPlant.id === excludeItemId) {
				continue
			}
			// Get the plant data to find its size
			const plantData = plantsData.find((p) => p.id === existingPlant.data.id)
			const existingSize = plantData ? plantData.plantingDistanceInFeet : 1
			if (
				itemX < existingPlant.x + existingSize &&
				itemX + itemSize > existingPlant.x &&
				itemY < existingPlant.y + existingSize &&
				itemY + itemSize > existingPlant.y
			) {
				const plantName = plantData ? plantData.displayName : 'Unknown plant'
				return {
					isValid: false,
					reason: `Overlaps with existing plant '${plantName}' (ID: ${existingPlant.id}).`,
				}
			}
		}
		return { isValid: true }
	}

	return new Promise<ValidationResult>((resolve, reject) => {
		setTimeout(() => {
			switch (context.operationType) {
				case 'item-move-within-zone':
					// Planned validation: occasionally reject moves within bed
					if (Math.random() > 0.02) {
						resolve({ isValid: true })
					} else {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: 'Plant is too established to move within bed',
						})
					}
					break
				case 'item-move-across-zones': {
					const targetBed = currentGarden.beds.find(
						(b: GardenBed) => b.id === context.targetZoneId,
					)
					const sourceBed = currentGarden.beds.find(
						(b: GardenBed) => b.id === context.sourceZoneId,
					)
					if (!targetBed || !sourceBed) {
						// System error: reject the promise
						reject(new Error('Bed not found for cross-zone move'))
						return
					}
					if (context.targetX === undefined || context.targetY === undefined) {
						// System error: reject the promise
						reject(new Error('Missing target coordinates for collision check.'))
						return
					}
					if (context.targetX < 0 || context.targetY < 0) {
						// System error: invalid coordinates
						reject(
							new Error(
								`Invalid target coordinates: x=${context.targetX}, y=${context.targetY}`,
							),
						)
						return
					}
					const itemSize = context.item.size
					const placementCheck = checkPlacementValidity(
						targetBed,
						context.targetX,
						context.targetY,
						itemSize,
						context.itemInstanceId,
					)
					if (!placementCheck.isValid) {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: `Cannot move plant: ${placementCheck.reason}`,
						})
						return
					}
					// Additional planned validation rules
					if (context.item.family === 'tomatoes' && targetBed.sunLevel < 1) {
						resolve({
							isValid: false,
							error:
								'Target bed has insufficient sunlight for tomatoes (requires level 1+)',
						})
					} else if (Math.random() > 0.1) {
						resolve({ isValid: true })
					} else {
						resolve({ isValid: false, error: 'Soil compatibility issue between beds' })
					}
					break
				}
				case 'item-add-to-zone': {
					const addTargetBed = currentGarden.beds.find(
						(b: GardenBed) => b.id === context.targetZoneId,
					)
					if (!addTargetBed) {
						// System error: reject the promise
						reject(new Error('Target bed not found for add operation'))
						return
					}
					// Planned validation: check bed capacity
					const occupiedCells = addTargetBed.plantPlacements.reduce(
						(total: number, placement: GridPlacement<PlantWithSize>) => {
							const plantData = plantsData.find((p) => p.id === placement.data.id)
							const plantSize = plantData ? plantData.plantingDistanceInFeet : 1
							return total + plantSize ** 2
						},
						0,
					)
					const totalCells = addTargetBed.width * addTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.8) {
						// Planned validation failure: return error result
						resolve({ isValid: false, error: 'Bed is too crowded for new plants' })
					} else if (Math.random() > 0.05) {
						resolve({ isValid: true })
					} else {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: 'Current season not suitable for this plant',
						})
					}
					break
				}
				case 'item-remove-from-zone': {
					// Planned validation: check for beneficial relationships
					const hasEdgeIndicators = currentGarden.edgeIndicators.some(
						(edge) =>
							edge.plantAId === context.itemInstanceId ||
							edge.plantBId === context.itemInstanceId,
					)
					if (hasEdgeIndicators && Math.random() > 0.7) {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: 'Plant has beneficial relationships with neighbors',
						})
					} else {
						resolve({ isValid: true })
					}
					break
				}
				case 'item-clone-in-zone': {
					const cloneTargetBed = currentGarden.beds.find(
						(b: GardenBed) => b.id === context.targetZoneId,
					)
					if (!cloneTargetBed) {
						// System error: reject the promise
						reject(new Error('Target bed not found for clone operation'))
						return
					}
					if (context.targetX === undefined || context.targetY === undefined) {
						// System error: reject the promise
						reject(new Error('Missing target coordinates for clone collision check.'))
						return
					}
					const cloneItemSize = context.item.size
					const clonePlacementCheck = checkPlacementValidity(
						cloneTargetBed,
						context.targetX,
						context.targetY,
						cloneItemSize,
					)
					if (!clonePlacementCheck.isValid) {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: `Cannot clone plant: ${clonePlacementCheck.reason}`,
						})
						return
					}

					// Planned validation: check bed capacity for cloning
					const occupiedCells = cloneTargetBed.plantPlacements.reduce(
						(total: number, placement: GridPlacement<PlantWithSize>) => {
							const plantData = plantsData.find((p) => p.id === placement.data.id)
							const plantSize = plantData ? plantData.plantingDistanceInFeet : 1
							return total + plantSize ** 2
						},
						0,
					)
					const totalCells = cloneTargetBed.width * cloneTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.75) {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: 'Target bed is too crowded for cloning (capacity check)',
						})
					} else if (Math.random() > 0.12) {
						resolve({ isValid: true })
					} else {
						// Planned validation failure: return error result
						resolve({
							isValid: false,
							error: 'Plant genetics not stable enough for cloning (random check)',
						})
					}
					break
				}
				default:
					// System error: reject the promise
					console.warn(
						'[Garden.svelte] customAsyncValidation: Unknown operationType in context:',
						context.operationType,
					)
					reject(new UnreachableError(context.operationType, `Unknown operation type`))
			}
		}, 100)
	})
}
</script>

<!-- You can add more UI elements here -->

<style>
/* Basic styling for feedback messages */
.feedback-container {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 1050; /* Ensure it's above other content */
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.feedback-message {
	padding: 10px 15px;
	color: white;
	border-radius: 5px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	min-width: 250px;
	text-align: center;
}

.loading-indicator {
	background-color: #007bff; /* Blue for loading */
}

.error-toast {
	background-color: #dc3545; /* Red for error */
}
</style>

<PageTitle route={route} />

<div class="feedback-container">
	{#if isAsyncValidating}
		<div class="feedback-message loading-indicator" role="status">Validating...</div>
	{/if}
	{#if validationError}
		<div class="feedback-message error-toast" role="alert" aria-live="assertive">
			{validationError}
		</div>
	{/if}
</div>

{#if gardenInstance}
	<GardenView
		garden={gardenInstance}
		onMovePlantInBed={handleMovePlantInBed}
		onMovePlantToDifferentBed={handleMovePlantToDifferentBed}
		onAddNewPlant={handleAddNewPlant}
		onDeletePlant={handleDeletePlant}
		edgeIndicators={gardenInstance.edgeIndicators}
		onRequestPlacement={handleRequestPlacement}
		onRequestRemoval={handleRequestRemoval}
		onRequestCloning={handleRequestCloning}
	/>
{:else}
	<div class="flex justify-center items-center h-full p-8">
		<span class="loading loading-ring loading-xl"></span>
		<div class="text-md font-bold">Loading garden...</div>
	</div>
{/if}
