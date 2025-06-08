import { writable, derived } from 'svelte/store'
import type { PlantMetadata } from '../../lib/entities/plant-metadata'
import { PlantRepository } from '../../lib/repositories/plant.repository'
import type { Item } from '../../lib/entities/item'

interface PlantsState {
	plants: Item<PlantMetadata>[]
	loading: boolean
	error: string | null
}

const plantRepository = new PlantRepository()

const initialState: PlantsState = {
	plants: [],
	loading: true,
	error: null,
}

// Create the writable store
const plantsState = writable<PlantsState>(initialState)

// Derived stores for convenience
export const plants = derived(plantsState, ($state) => $state.plants)
export const plantsLoading = derived(plantsState, ($state) => $state.loading)
export const plantsError = derived(plantsState, ($state) => $state.error)
export const plantsReady = derived(
	plantsState,
	($state) => !$state.loading && $state.error === null,
)

// Function to load plants
export async function loadPlants(): Promise<void> {
	plantsState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const plantsData = await plantRepository.findAll()
		plantsState.update((state) => ({
			...state,
			plants: plantsData,
			loading: false,
			error: null,
		}))
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to load plants'
		plantsState.update((state) => ({
			...state,
			loading: false,
			error: errorMessage,
		}))
		console.error('Error loading plants:', error)
	}
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
		return $plants.filter((plant) => plant.metadata.family === family)
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

// Auto-load plants when the store is created
loadPlants().catch((error: unknown) => {
	console.error('Error loading plants:', error)
})

export default plantsState
