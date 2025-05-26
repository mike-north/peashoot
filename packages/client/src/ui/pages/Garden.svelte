<script lang="ts">
import type { Garden } from '../../lib/garden'
import { movePlantBetweenBeds } from '../../lib/garden'
import type { GardenBed } from '../../lib/garden-bed'
import { updatePlantPositionInBed } from '../../lib/garden-bed'
import type { PlantPlacement } from '../../lib/plant-placement'
import GardenView from '../components/GardenView.svelte'

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
					plantTile: { id: 'tomato', name: 'tomato', icon: '🍅', size: 2 },
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
					plantTile: { id: 'cherry', name: 'cherry', icon: '🍒', size: 3 },
				},
				{
					id: 'tomato_2',
					x: 0,
					y: 0,
					plantTile: { id: 'tomato', name: 'tomato', icon: '🍅', size: 2 },
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
</script>

<span class="text-2xl font-bold">Garden</span>

<GardenView
	garden={gardenInstance}
	onMovePlantInBed={handleMovePlantInBed}
	onMovePlantToDifferentBed={handleMovePlantToDifferentBed}
	edgeIndicators={gardenInstance.edgeIndicators} />

<!-- You can add more UI elements here -->

<style>
</style>
