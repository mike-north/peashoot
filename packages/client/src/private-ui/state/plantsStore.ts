import { writable, derived } from 'svelte/store'
import type { Plant } from '../../private-lib/plant'
import { fetchPlants } from '../../lib/plant-data'

interface PlantsState {
	plants: Plant[]
	loading: boolean
	error: string | null
}

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
		const plantsData = await fetchPlants()
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
	return (id: string): Plant | undefined => {
		return $plants.find((plant) => plant.id === id)
	}
})

// Function to get plants by family
export const getPlantsByFamily = derived(plants, ($plants) => {
	return (family: string): Plant[] => {
		return $plants.filter((plant) => plant.family === family)
	}
})

// Auto-load plants when the store is created
loadPlants().catch((error: unknown) => {
	console.error('Error loading plants:', error)
})

export default plantsState
