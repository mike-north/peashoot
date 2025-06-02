<script lang="ts">
import GardenDiagram from '../private/components/GardenDiagram.svelte'
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import { GardenAdapter } from '../lib/adapters/garden-adapter'
import {
	movePlantBetweenBedsAndCreateNewGarden,
	type Garden,
} from '../lib/entities/garden'
import type { GridPlaceable, GridPlacement } from '../private/grid/grid-placement'
import { tileSizeForPlant, type Plant } from '../lib/entities/plant'
import { updatePlantPositionInBed, type GardenBed, type PlantWithSize } from '../lib/entities/garden-bed'

const { route } = $props()
const gardenAdapter = new GardenAdapter()

let gardenInstance: Garden | undefined = $state<Garden | undefined>(undefined)

onMount(() => {
	gardenAdapter
		.fetchFirstGarden()
		.then((garden) => {
			gardenInstance = garden
		})
		.catch((err: unknown) => {
			console.error('Error fetching gardens', { cause: err })
		})
})

function movePlantBetweenBeds(
	garden: Garden,
	sourceBedId: string,
	targetBedId: string,
	placement: GridPlacement<GridPlaceable>,
	newX: number,
	newY: number,
) {
	const newGarden = movePlantBetweenBedsAndCreateNewGarden(
		garden,
		sourceBedId,
		targetBedId,
		placement,
		newX,
		newY,
	)
	gardenInstance = newGarden
}

function handleAddNewPlant(bedId: string, item: Plant, x: number, y: number) {
	if (!gardenInstance) {
		throw new Error('Attempt to add new plant to undefined garden')
	}
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		const newPlantId = `${item.family}_${Date.now()}`

		const newPlacement: GridPlacement<PlantWithSize> = {
			id: newPlantId,
			x,
			y,
			size: tileSizeForPlant(item),
			item: item,
			sourceZoneId: bedId,
		}

		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId ? { ...b, placements: [...b.placements, newPlacement] } : b,
		)

		console.log(`[Garden] Added new ${item.displayName} to bed ${bedId} at (${x}, ${y})`)
	} else {
		console.error('[Garden] Bed not found for addNewPlant:', bedId)
	}
}

function handleMovePlantInBed(
	bedId: string,
	plantId: string,
	newX: number,
	newY: number,
) {
	if (!gardenInstance) {
		throw new Error('Attempt to move plant in bed in undefined garden')
	}
	const bed = gardenInstance.beds.find((b: GardenBed) => b.id === bedId)
	if (bed) {
		gardenInstance.beds = gardenInstance.beds.map((b: GardenBed) =>
			b.id === bedId ? updatePlantPositionInBed(b, plantId, newX, newY) : b,
		)
	} else {
		console.error('[App.svelte] Bed not found for movePlantInBed:', bedId)
	}
}
</script>

<PageTitle route={route} />
{#if gardenInstance}
	<GardenDiagram
		garden={gardenInstance}
		handleMovePlantInBed={handleMovePlantInBed}
		handleAddNewPlant={handleAddNewPlant}
		movePlantBetweenBeds={movePlantBetweenBeds}
	/>
{/if}
