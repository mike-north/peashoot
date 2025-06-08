import { writable, derived } from 'svelte/store'
import type { Workspace } from '../../lib/entities/workspace'
import type { Item } from '../../lib/entities/item'
import type { PlantMetadata } from '../../lib/entities/plant-metadata'
import { getGardenRepository } from '../../lib/repositories/repository-factory'

interface GardenState {
	gardens: Workspace[]
	currentGarden: Workspace | null
	loading: boolean
	error: string | null
}

// Get the appropriate repository based on current setting
const gardenRepository = getGardenRepository()

const initialState: GardenState = {
	gardens: [],
	currentGarden: null,
	loading: true,
	error: null,
}

// Create the writable store
const gardenState = writable<GardenState>(initialState)

// Derived stores for convenience
export const gardens = derived(gardenState, ($state) => $state.gardens)
export const currentGarden = derived(gardenState, ($state) => $state.currentGarden)
export const gardensLoading = derived(gardenState, ($state) => $state.loading)
export const gardensError = derived(gardenState, ($state) => $state.error)
export const gardensReady = derived(
	gardenState,
	($state) => !$state.loading && $state.error === null && $state.gardens.length > 0,
)

// Function to load all gardens
export async function loadGardens(): Promise<void> {
	gardenState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const gardensData = await gardenRepository.findAll()
		gardenState.update((state) => ({
			...state,
			gardens: gardensData,
			loading: false,
			error: null,
		}))
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to load gardens'
		gardenState.update((state) => ({
			...state,
			loading: false,
			error: errorMessage,
		}))
		console.error('Error loading gardens:', error)
	}
}

// Function to load the first garden
export async function loadFirstGarden(): Promise<Workspace | null> {
	gardenState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const gardensData = await gardenRepository.findAll()
		const firstGarden = gardensData.length > 0 ? gardensData[0] : null

		gardenState.update((state) => ({
			...state,
			gardens: gardensData,
			currentGarden: firstGarden,
			loading: false,
			error: null,
		}))

		return firstGarden
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to load gardens'
		gardenState.update((state) => ({
			...state,
			loading: false,
			error: errorMessage,
		}))
		console.error('Error loading first garden:', error)
		return null
	}
}

// Function to get a garden by ID
export async function fetchGardenById(id: string): Promise<Workspace | null> {
	try {
		const garden = await gardenRepository.findById(id)

		if (garden) {
			// Update the current garden in the store
			gardenState.update((state) => ({
				...state,
				currentGarden: garden,
			}))
		}

		return garden
	} catch (error) {
		console.error(`Error fetching garden with id ${id}:`, error)
		return null
	}
}

// Function to save a garden
export async function saveGarden(garden: Workspace): Promise<Workspace> {
	try {
		const savedGarden = await gardenRepository.save(garden)

		// Update the store
		gardenState.update((state) => {
			const index = state.gardens.findIndex((g) => g.id === savedGarden.id)

			let updatedGardens = [...state.gardens]
			if (index >= 0) {
				// Update existing garden
				updatedGardens[index] = savedGarden
			} else {
				// Add new garden
				updatedGardens = [...state.gardens, savedGarden]
			}

			return {
				...state,
				gardens: updatedGardens,
				currentGarden:
					state.currentGarden?.id === savedGarden.id ? savedGarden : state.currentGarden,
			}
		})

		return savedGarden
	} catch (error) {
		console.error('Error saving garden:', error)
		throw error
	}
}

/**
 * Update the store with a new garden state
 * Used internally by the garden operations
 */
function updateGardenInStore(garden: Workspace): void {
	gardenState.update((state) => {
		const index = state.gardens.findIndex((g) => g.id === garden.id)

		let updatedGardens = [...state.gardens]
		if (index >= 0) {
			// Update existing garden
			updatedGardens[index] = garden
		} else {
			// Add new garden
			updatedGardens = [...state.gardens, garden]
		}

		return {
			...state,
			gardens: updatedGardens,
			currentGarden: state.currentGarden?.id === garden.id ? garden : state.currentGarden,
		}
	})
}

/**
 * Add a plant to a garden zone
 */
export async function addPlantToGarden(
	gardenId: string,
	zoneId: string,
	plant: Item<PlantMetadata>,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await gardenRepository.addPlantToGarden(
			gardenId,
			zoneId,
			plant,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error adding plant to garden:', error)
		return false
	}
}

/**
 * Move a plant within a zone
 */
export async function movePlantWithinZone(
	gardenId: string,
	zoneId: string,
	plantId: string,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await gardenRepository.movePlantWithinZone(
			gardenId,
			zoneId,
			plantId,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error moving plant within zone:', error)
		return false
	}
}

/**
 * Move a plant between zones
 */
export async function movePlantBetweenZones(
	gardenId: string,
	sourceZoneId: string,
	targetZoneId: string,
	plantId: string,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await gardenRepository.movePlantBetweenZones(
			gardenId,
			sourceZoneId,
			targetZoneId,
			plantId,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error moving plant between zones:', error)
		return false
	}
}

/**
 * Remove a plant from a zone
 */
export async function removePlantFromZone(
	gardenId: string,
	zoneId: string,
	plantId: string,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await gardenRepository.removePlantFromZone(
			gardenId,
			zoneId,
			plantId,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error removing plant from zone:', error)
		return false
	}
}

/**
 * Clone a plant from one zone to another
 */
export async function clonePlant(
	gardenId: string,
	sourceZoneId: string,
	targetZoneId: string,
	sourcePlantId: string,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await gardenRepository.clonePlant(
			gardenId,
			sourceZoneId,
			targetZoneId,
			sourcePlantId,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error cloning plant:', error)
		return false
	}
}

export default gardenState
