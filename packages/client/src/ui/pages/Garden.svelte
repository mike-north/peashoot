<script lang="ts">
import GardenView from '../components/GardenView.svelte'
import type { GardenBed } from '../../lib/garden-bed'
import { updatePlantPositionInBed } from '../../lib/garden-bed'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import type { Garden } from '../../lib/garden'
import { movePlantBetweenBeds, findBed, findPlantPlacement } from '../../lib/garden'
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

const { route }: { route: RouteResult } = $props()

let gardenInstance = $state<Garden>({
	id: 'garden_0',
	edgeIndicators: [
		{
			id: 'edge_indicator_0',
			plantAId: 'lettuce_1',
			plantBId: 'tomato_1',
			color: 'red',
		},
		{
			id: 'edge_indicator_1',
			plantAId: 'cherry_tomato_1',
			plantBId: 'tomato_2',
			color: 'red',
		},
	],
	beds: [
		{
			id: 'bed_-2',
			width: 12,
			height: 3,
			waterLevel: 0,
			sunLevel: 0,
			plantPlacements: [],
		},
		{
			id: 'bed_-1',
			width: 1,
			height: 1,
			waterLevel: 0,
			sunLevel: 0,
			plantPlacements: [
				{
					id: 'placeholder_000',
					x: 0,
					y: 0,
					plantTile: {
						id: 'lettuce_0',
						name: 'lettuce',
						icon: '🌱',
						size: 1,
						plantFamily: { name: 'lettuce', colorVariant: 'green' },
					},
				},
			],
		},
		{
			id: 'bed_0',
			width: 1,
			height: 1,
			waterLevel: 0,
			sunLevel: 0,
			plantPlacements: [
				{
					id: 'placeholder_0',
					x: 0,
					y: 0,
					plantTile: {
						id: 'lettuce_0',
						name: 'lettuce',
						icon: '🌱',
						size: 1,
						plantFamily: { name: 'lettuce', colorVariant: 'green' },
					},
				},
			],
		},
		{
			id: 'bed_1',
			width: 6,
			height: 2,
			waterLevel: 2,
			sunLevel: 4,
			plantPlacements: [
				{
					id: 'tomato_1',
					x: 0,
					y: 0,
					plantTile: {
						id: 'tomato',
						name: 'tomato',
						icon: '🍅',
						size: 2,
						plantFamily: { name: 'tomatoes', colorVariant: 'red' },
					},
				},
				{
					id: 'lettuce_1',
					x: 2,
					y: 0,
					plantTile: {
						id: 'lettuce',
						name: 'lettuce',
						icon: '🥬',
						size: 1,
						plantFamily: { name: 'lettuce', colorVariant: 'green' },
					},
				},
			],
		},
		{
			id: 'bed_2',
			width: 6,
			height: 2,
			waterLevel: 2,
			sunLevel: 4,
			plantPlacements: [
				{
					id: 'tomato_44',
					x: 0,
					y: 0,
					plantTile: {
						id: 'tomato',
						name: 'tomato',
						icon: '🍅',
						size: 2,
						plantFamily: { name: 'tomatoes', colorVariant: 'red' },
					},
				},
				{
					id: 'lettuce_44',
					x: 2,
					y: 0,
					plantTile: {
						id: 'lettuce',
						name: 'lettuce',
						icon: '🥬',
						size: 1,
						plantFamily: { name: 'lettuce', colorVariant: 'green' },
					},
				},
			],
		},
		{
			id: 'bed_3',
			width: 12,
			height: 4,
			waterLevel: 3,
			sunLevel: 3,
			plantPlacements: [
				{
					id: 'bing_cherry_1',
					x: 2,
					y: 1,
					plantTile: {
						id: 'cherry',
						name: 'cherry',
						icon: '🍒',
						size: 3,
						plantFamily: { name: 'cherries', colorVariant: 'red' },
					},
				},
				{
					id: 'tomato_2',
					x: 0,
					y: 0,
					plantTile: {
						id: 'tomato',
						name: 'tomato',
						icon: '🍅',
						size: 2,
						plantFamily: { name: 'tomatoes', colorVariant: 'red' },
					},
				},
				{
					id: 'lettuce_2',
					x: 2,
					y: 0,
					plantTile: {
						id: 'lettuce',
						name: 'lettuce',
						icon: '🥬',
						size: 1,
						plantFamily: { name: 'lettuce', colorVariant: 'green' },
					},
				},

				{
					id: 'strawberry_1',
					x: 6,
					y: 0,
					plantTile: {
						id: 'strawberry',
						name: 'Strawberry',
						icon: '🍓',
						size: 1,
						plantFamily: { name: 'strawberries', colorVariant: 'red' },
					},
				},

				{
					id: 'daisy_1',
					x: 6,
					y: 3,
					plantTile: {
						id: 'daisy',
						name: 'Daisy',
						icon: '🌼',
						size: 1,
						plantFamily: { name: 'daisies', colorVariant: 'white' },
					},
				},
			],
		},
	],
})

let isAsyncValidating = $state<boolean>(false)
let validationError = $state<string | null>(null)

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

		if (details.operationType === 'item-move-within-zone' && details.originalInstanceId) {
			handleMovePlantInBed(
				details.targetZoneId,
				details.originalInstanceId,
				details.x,
				details.y,
			)
		} else if (
			details.operationType === 'item-move-across-zones' &&
			details.originalInstanceId &&
			details.sourceZoneId
		) {
			const sourceBedForCallback = findBed(gardenInstance, details.sourceZoneId)
			const plantPlacementForCallback = sourceBedForCallback
				? findPlantPlacement(sourceBedForCallback, details.originalInstanceId)
				: undefined
			if (plantPlacementForCallback) {
				const existingItem = plantPlacementToExistingGardenItem(plantPlacementForCallback)
				handleMovePlantToDifferentBed(
					details.sourceZoneId,
					details.targetZoneId,
					existingItem,
					details.x,
					details.y,
				)
			} else {
				console.error(
					'[Garden] Could not find original plant for move-across-zones callback after validation.',
				)
			}
		} else if (details.operationType === 'item-add-to-zone') {
			handleAddNewPlant(details.targetZoneId, details.itemData, details.x, details.y)
		}
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw error
	}
}

async function handleRequestRemoval(details: RemovalRequestDetails): Promise<void> {
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
		handleDeletePlant(details.instanceId, details.sourceZoneId)
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw error
	}
}

async function handleRequestCloning(details: CloningRequestDetails): Promise<void> {
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
		handleAddNewPlant(
			details.targetCloneZoneId,
			details.itemDataToClone,
			details.targetCloneX,
			details.targetCloneY,
		)
		return
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		handleAsyncValidationError(message)
		throw error
	}
}

const customAsyncValidation: GardenAsyncValidationFunction = async (
	context: GardenValidationContext,
) => {
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
