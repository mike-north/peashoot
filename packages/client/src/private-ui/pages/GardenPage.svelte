<script lang="ts">
import GardenView from '../components/GardenView.svelte'
import type { GardenBed } from '../../private-lib/garden-bed'
import { updatePlantPositionInBed } from '../../private-lib/garden-bed'
import type { PlantPlacement } from '../../private-lib/plant-placement'
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
	existingGardenItemToPlantPlacement,
	plantPlacementToExistingGardenItem,
	type GardenItem,
	type ExistingGardenItem,
	type GardenValidationContext,
	type GardenAsyncValidationFunction,
	type PlacementRequestDetails,
	type RemovalRequestDetails,
	type CloningRequestDetails,
	type GardenZoneContext,
} from '../state/gardenDragState'
import { UnreachableError } from '../../errors/unreachabe'
import { ASYNC_VALIDATION_TIMEOUT_MS } from '../../private-lib/dnd/constants'
import { AsyncValidationError } from '../../errors/async-validation'
import { fetchGardens } from '../../lib/garden-data'
import { onMount } from 'svelte'

const { route }: { route: RouteResult } = $props()

let gardenInstance: Garden | undefined = $state<Garden | undefined>(undefined)

let isAsyncValidating = $state<boolean>(false)
let validationError = $state<string | null>(null)

onMount(() => {
	fetchGardens()
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
	existingItem: ExistingGardenItem,
	newX: number,
	newY: number,
) {
	const plantPlacementArg = existingGardenItemToPlantPlacement(existingItem)
	if (!gardenInstance) return
	gardenInstance = movePlantBetweenBeds(
		gardenInstance,
		sourceBedId,
		targetBedId,
		plantPlacementArg,
		newX,
		newY,
	)
}

function handleAddNewPlant(bedId: string, item: GardenItem, x: number, y: number) {
	if (!gardenInstance) return
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		const plantForPlacement: Plant = {
			id: item.id,
			name: item.name,
			icon: item.icon,
			size: item.size ?? 1,
			plantFamily: item.plantFamily,
		}
		const newPlantId = `${plantForPlacement.plantFamily.name}_${Date.now()}`

		const newPlacement: PlantPlacement = {
			id: newPlantId,
			x,
			y,
			plantTile: plantForPlacement,
		}

		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId
				? { ...b, plantPlacements: [...b.plantPlacements, newPlacement] }
				: b,
		)

		console.log(`[Garden] Added new ${item.name} to bed ${bedId} at (${x}, ${y})`)
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
): GardenZoneContext | undefined {
	if (!bed) return undefined
	return {
		...bed,
		plantPlacements: bed.plantPlacements.map(plantPlacementToExistingGardenItem),
	} as GardenZoneContext
}

async function handleRequestPlacement(details: PlacementRequestDetails): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const targetBed = findBed(gardenInstance, details.targetZoneId)
	const sourceBed = details.sourceZoneId
		? findBed(gardenInstance, details.sourceZoneId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext> = {
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

	const validationContext = baseValidationContext as GardenValidationContext

	try {
		await customAsyncValidation(validationContext)
		handleAsyncValidationSuccess()
		// Don't perform operations here - let the caller handle them after validation succeeds
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw new AsyncValidationError(`Error while handling placement request`, error)
	}
}

async function handleRequestRemoval(details: RemovalRequestDetails): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const sourceBed = findBed(gardenInstance, details.sourceZoneId)
	const plantToRemove = sourceBed
		? findPlantPlacement(sourceBed, details.instanceId)
		: undefined

	const baseValidationContext: Partial<GardenValidationContext> = {
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

	const validationContext = baseValidationContext as GardenValidationContext

	try {
		await customAsyncValidation(validationContext)
		handleAsyncValidationSuccess()
		// Don't perform operations here - let the caller handle them after validation succeeds
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw new AsyncValidationError(`Error while handling removal request`, error)
	}
}

async function handleRequestCloning(details: CloningRequestDetails): Promise<void> {
	if (!gardenInstance) return
	handleAsyncValidationStart()

	const sourceBed = findBed(gardenInstance, details.sourceOriginalZoneId)
	const targetBed = findBed(gardenInstance, details.targetCloneZoneId)

	const baseValidationContext: Partial<GardenValidationContext> = {
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

	const validationContext = baseValidationContext as GardenValidationContext

	try {
		await customAsyncValidation(validationContext)
		handleAsyncValidationSuccess()
		// Don't perform operations here - let the caller handle them after validation succeeds
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw new AsyncValidationError(`Error while handling cloning request`, error)
	}
}

const customAsyncValidation: GardenAsyncValidationFunction = async (
	context: GardenValidationContext,
) => {
	await new Promise((resolve) => setTimeout(resolve, ASYNC_VALIDATION_TIMEOUT_MS))
	if (!context.applicationContext) {
		return Promise.reject(
			new Error('Garden application context not provided in validation'),
		)
	}
	const currentGarden = context.applicationContext.garden

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
			const existingSize = existingPlant.plantTile.size || 1
			if (
				itemX < existingPlant.x + existingSize &&
				itemX + itemSize > existingPlant.x &&
				itemY < existingPlant.y + existingSize &&
				itemY + itemSize > existingPlant.y
			) {
				return {
					isValid: false,
					reason: `Overlaps with existing plant '${existingPlant.plantTile.name}' (ID: ${existingPlant.id}).`,
				}
			}
		}
		return { isValid: true }
	}

	return new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			switch (context.operationType) {
				case 'item-move-within-zone':
					if (Math.random() > 0.02) resolve()
					else reject(new Error('Plant is too established to move within bed'))
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
						context.item.size === undefined
					) {
						reject(
							new Error('Missing target coordinates or item size for collision check.'),
						)
						return
					}
					const placementCheck = checkPlacementValidity(
						targetBed,
						context.targetX,
						context.targetY,
						context.item.size,
						context.itemInstanceId,
					)
					if (!placementCheck.isValid) {
						reject(new Error(`Cannot move plant: ${placementCheck.reason}`))
						return
					}
					if (context.item.plantFamily.name === 'tomatoes' && targetBed.sunLevel < 3) {
						reject(new Error('Target bed has insufficient sunlight for tomatoes'))
					} else if (Math.random() > 0.1) resolve()
					else reject(new Error('Soil compatibility issue between beds'))
					break
				}
				case 'item-add-to-zone': {
					const addTargetBed = currentGarden.beds.find(
						(b: GardenBed) => b.id === context.targetZoneId,
					)
					if (!addTargetBed) {
						reject(new Error('Target bed not found for add operation'))
						return
					}
					const occupiedCells = addTargetBed.plantPlacements.reduce(
						(total: number, plant: PlantPlacement) => {
							return total + (plant.plantTile.size || 1) ** 2
						},
						0,
					)
					const totalCells = addTargetBed.width * addTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.8) reject(new Error('Bed is too crowded for new plants'))
					else if (Math.random() > 0.05) resolve()
					else reject(new Error('Current season not suitable for this plant'))
					break
				}
				case 'item-remove-from-zone': {
					const hasEdgeIndicators = currentGarden.edgeIndicators.some(
						(edge) =>
							edge.plantAId === context.itemInstanceId ||
							edge.plantBId === context.itemInstanceId,
					)
					if (hasEdgeIndicators && Math.random() > 0.7)
						reject(new Error('Plant has beneficial relationships with neighbors'))
					else resolve()
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
						context.item.size === undefined
					) {
						reject(
							new Error(
								'Missing target coordinates or item size for clone collision check.',
							),
						)
						return
					}
					const clonePlacementCheck = checkPlacementValidity(
						cloneTargetBed,
						context.targetX,
						context.targetY,
						context.item.size,
					)
					if (!clonePlacementCheck.isValid) {
						reject(new Error(`Cannot clone plant: ${clonePlacementCheck.reason}`))
						return
					}

					const occupiedCells = cloneTargetBed.plantPlacements.reduce(
						(total: number, plant: PlantPlacement) => {
							return total + (plant.plantTile.size || 1) ** 2
						},
						0,
					)
					const totalCells = cloneTargetBed.width * cloneTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.75)
						reject(new Error('Target bed is too crowded for cloning (capacity check)'))
					else if (Math.random() > 0.12) resolve()
					else
						reject(
							new Error('Plant genetics not stable enough for cloning (random check)'),
						)
					break
				}
				default:
					console.warn(
						'[Garden.svelte] customAsyncValidation: Unknown operationType in context:',
						context.operationType,
					)
					reject(new UnreachableError(context.operationType, `Unknown operation type`))
			}
		}, 200)
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
