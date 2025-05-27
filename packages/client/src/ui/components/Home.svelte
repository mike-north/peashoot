<script lang="ts">
import GardenView from './GardenView.svelte'
import type { GardenBed } from '../../lib/garden-bed'
import type { PlantPlacement } from '../../lib/plant-placement'
import type { Plant } from '../../lib/plant'
import type { Garden } from '../../lib/garden'

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
					id: 'cherry_tomato_1',
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
		bed.plantPlacements = bed.plantPlacements.map((p: PlantPlacement) =>
			p.id === plantId ? { ...p, x: newX, y: newY } : p,
		)
	} else {
		console.error('[Home.svelte] Bed not found for movePlantInBed:', bedId)
	}
}

function handleMovePlantToDifferentBed(
	sourceBedId: string,
	targetBedId: string,
	plant: PlantPlacement,
	newX: number,
	newY: number,
) {
	const sourceBed = gardenInstance.beds.find((b: GardenBed) => b.id === sourceBedId)
	const targetBed = gardenInstance.beds.find((b: GardenBed) => b.id === targetBedId)

	if (sourceBed && targetBed) {
		sourceBed.plantPlacements = sourceBed.plantPlacements.filter(
			(p: PlantPlacement) => p.id !== plant.id,
		)
		targetBed.plantPlacements.push({
			...plant,
			x: newX,
			y: newY,
		})
	} else {
		console.error(
			'[Home.svelte] Source or target bed not found for movePlantToDifferentBed.',
		)
	}
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
		bed.plantPlacements.push(newPlacement)

		console.log(`[Home] Added new ${plant.name} to bed ${bedId} at (${x}, ${y})`)
	} else {
		console.error('[Home] Bed not found for addNewPlant:', bedId)
	}
}

function handleDeletePlant(plantId: string, bedId: string) {
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		// Remove the plant from the bed
		bed.plantPlacements = bed.plantPlacements.filter((p) => p.id !== plantId)

		console.log(`[Home] Deleted plant ${plantId} from bed ${bedId}`)
	} else {
		console.error('[Home] Bed not found for deletePlant:', bedId)
	}
}
</script>

<style>
main {
	font-family: Arial, sans-serif;
	padding: 1em;
}
h1 {
	color: #333;
	text-align: center;
}
</style>

<main>
	<h1>My Garden Planner</h1>
	<GardenView
		garden={gardenInstance}
		onMovePlantInBed={handleMovePlantInBed}
		onMovePlantToDifferentBed={handleMovePlantToDifferentBed}
		onAddNewPlant={handleAddNewPlant}
		onDeletePlant={handleDeletePlant}
		edgeIndicators={gardenInstance.edgeIndicators}
	/>
	<!-- You can add more UI elements here -->
</main>
