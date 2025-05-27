<script lang="ts">
import GardenView from '../components/GardenView.svelte'
import type { GardenBed } from '../../lib/garden-bed'
import { updatePlantPositionInBed } from '../../lib/garden-bed'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import type { Garden } from '../../lib/garden'
import { movePlantBetweenBeds } from '../../lib/garden'
import PageTitle from '../components/PageTitle.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import type { ValidationContext, AsyncValidationFunction } from '../state/dragState'

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
			width: 7,
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
	plant: PlantPlacement,
	newX: number,
	newY: number,
) {
	gardenInstance = movePlantBetweenBeds(
		gardenInstance,
		sourceBedId,
		targetBedId,
		plant,
		newX,
		newY,
	)
}

function handleAddNewPlant(bedId: string, plant: Plant, x: number, y: number) {
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		// Generate a unique ID for the new plant placement
		const newPlantId = `${plant.plantFamily.name}_${Date.now()}`

		const newPlacement: PlantPlacement = {
			id: newPlantId,
			x,
			y,
			plantTile: plant,
		}

		// Add the new plant to the bed
		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId
				? { ...b, plantPlacements: [...b.plantPlacements, newPlacement] }
				: b,
		)

		console.log(`[Garden] Added new ${plant.name} to bed ${bedId} at (${x}, ${y})`)
	} else {
		console.error('[Garden] Bed not found for addNewPlant:', bedId)
	}
}

function handleDeletePlant(plantId: string, bedId: string) {
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		// Remove the plant from the bed
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

// Custom validation function with realistic business logic
const customAsyncValidation: AsyncValidationFunction = async (
	context: ValidationContext,
) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			switch (context.operationType) {
				case 'within-bed-move':
					if (Math.random() > 0.02) {
						resolve()
					} else {
						reject(new Error('Plant is too established to move within bed'))
					}
					break
				case 'across-beds-move': {
					const targetBed = context.garden.beds.find((b) => b.id === context.targetBedId)
					const sourceBed = context.garden.beds.find((b) => b.id === context.sourceBedId)
					if (!targetBed || !sourceBed) {
						reject(new Error('Bed not found'))
						return
					}
					if (context.plant.plantFamily.name === 'tomatoes' && targetBed.sunLevel < 3) {
						reject(new Error('Target bed has insufficient sunlight for tomatoes'))
					} else if (Math.random() > 0.1) {
						resolve()
					} else {
						reject(new Error('Soil compatibility issue between beds'))
					}
					break
				}
				case 'addition': {
					const addTargetBed = context.garden.beds.find((b) => b.id === context.targetBedId)
					if (!addTargetBed) {
						reject(new Error('Target bed not found'))
						return
					}
					const occupiedCells = addTargetBed.plantPlacements.reduce((total, plant) => {
						return total + (plant.plantTile.size || 1) ** 2
					}, 0)
					const totalCells = addTargetBed.width * addTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.8) {
						reject(new Error('Bed is too crowded for new plants'))
					} else if (Math.random() > 0.05) {
						resolve()
					} else {
						reject(new Error('Current season not suitable for this plant'))
					}
					break
				}
				case 'removal': {
					const hasEdgeIndicators = context.garden.edgeIndicators.some(
						(edge) =>
							edge.plantAId === context.plantId || edge.plantBId === context.plantId,
					)
					if (hasEdgeIndicators && Math.random() > 0.7) {
						reject(new Error('Plant has beneficial relationships with neighbors'))
					} else {
						resolve()
					}
					break
				}
				case 'clone': {
					const cloneTargetBed = context.garden.beds.find((b) => b.id === context.targetBedId)
					if (!cloneTargetBed) {
						reject(new Error('Target bed not found'))
						return
					}
					const occupiedCells = cloneTargetBed.plantPlacements.reduce((total, plant) => {
						return total + (plant.plantTile.size || 1) ** 2
					}, 0)
					const totalCells = cloneTargetBed.width * cloneTargetBed.height
					const occupancyRate = occupiedCells / totalCells
					if (occupancyRate > 0.75) {
						reject(new Error('Target bed is too crowded for cloning'))
					} else if (Math.random() > 0.12) {
						resolve()
					} else {
						reject(new Error('Plant genetics not stable enough for cloning'))
					}
					break
				}
				default:
					reject(new Error('Unknown operation type'))
			}
		}, 200)
	})
}
</script>

<!-- You can add more UI elements here -->

<style>
</style>

<PageTitle route={route} />

<GardenView
	garden={gardenInstance}
	onMovePlantInBed={handleMovePlantInBed}
	onMovePlantToDifferentBed={handleMovePlantToDifferentBed}
	onAddNewPlant={handleAddNewPlant}
	onDeletePlant={handleDeletePlant}
	edgeIndicators={gardenInstance.edgeIndicators}
	asyncValidation={customAsyncValidation}
/>
