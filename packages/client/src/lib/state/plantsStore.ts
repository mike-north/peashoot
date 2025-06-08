import { writable, derived } from 'svelte/store'
import type { PlantMetadata } from '../../lib/entities/plant-metadata'
import { PlantRepository } from '../../lib/repositories/plant.repository'
import type { Item } from '../../lib/entities/item'

interface PlantsState {
	plants: Item<PlantMetadata>[]
}

const plantRepository = new PlantRepository()

const initialState: PlantsState = {
	plants: [],
}

// Create the writable store
const plantsState = writable<PlantsState>(initialState)

// Derived stores for convenience
export const plants = derived(plantsState, ($state) => $state.plants)

export function setPlants(plants: Item<PlantMetadata>[]) {
	plantsState.update((state) => ({ ...state, plants }))
}

// Function to get a plant by ID
export const getPlantById = derived(plants, ($plants) => {
	return (id: string): Item<PlantMetadata> | undefined => {
		return $plants.find((plant) => plant.id === id)
	}
})

// Function to get plants by family
export const getPlantsByFamily = derived(plants, ($plants) => {
	return (family: string): Item<PlantMetadata>[] => {
		return $plants.filter((plant) => plant.category === family)
	}
})

// Function to fetch a plant directly from the repository
export async function fetchPlantById(id: string): Promise<Item<PlantMetadata> | null> {
	return plantRepository.findById(id)
}

// Function to validate and cast an item to PlantItem
export function validateAndCastItem(item: unknown): Item<PlantMetadata> {
	return plantRepository.validateAndCastItem(item)
}

export default plantsState
