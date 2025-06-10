import { writable, derived } from 'svelte/store'
import { ItemRepository } from '../repositories/item.repository'
import type { Item } from '@peashoot/types'

interface ItemsState {
	items: Item[]
}

const itemRepository = new ItemRepository()

const initialState: ItemsState = {
	items: [],
}

// Create the writable store
const plantsState = writable<ItemsState>(initialState)

// Derived stores for convenience
export const plants = derived(plantsState, ($state) => $state.items)

export function setPlants(plants: Item[]) {
	plantsState.update((state) => ({ ...state, items: plants }))
}

// Function to get a plant by ID
export const getPlantById = derived(plants, ($plants) => {
	return (id: string): Item | undefined => {
		return $plants.find((plant) => plant.id === id)
	}
})

// Function to get plants by family
export const getPlantsByFamily = derived(plants, ($plants) => {
	return (family: string): Item[] => {
		return $plants.filter((plant) => plant.category === family)
	}
})

// Function to fetch a plant directly from the repository
export async function fetchPlantById(id: string): Promise<Item | null> {
	return itemRepository.findById(id)
}

// Function to validate and cast an item to PlantItem
export function validateAndCastItem(item: unknown): Item {
	return itemRepository.validateAndCastItem(item)
}

export default plantsState
