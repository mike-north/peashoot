import { writable, derived } from 'svelte/store'
import { getWorkspaceRepository } from '../../lib/repositories/repository-factory'
import type { Item, Workspace } from '@peashoot/types'

interface WorkspaceState {
	workspaces: Workspace[]
	currentWorkspace: Workspace | null
	loading: boolean
	error: string | null
}

// Get the appropriate repository based on current setting
const workspaceRepository = getWorkspaceRepository()

const initialState: WorkspaceState = {
	workspaces: [],
	currentWorkspace: null,
	loading: true,
	error: null,
}

// Create the writable store
const gardenState = writable<WorkspaceState>(initialState)

// Derived stores for convenience
export const gardens = derived(gardenState, ($state) => $state.workspaces)
export const currentGarden = derived(gardenState, ($state) => $state.currentWorkspace)
export const gardensLoading = derived(gardenState, ($state) => $state.loading)
export const gardensError = derived(gardenState, ($state) => $state.error)
export const gardensReady = derived(
	gardenState,
	($state) => !$state.loading && $state.error === null && $state.workspaces.length > 0,
)

// Function to load all gardens
export async function loadGardens(): Promise<void> {
	gardenState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const gardensData = await workspaceRepository.findAll()
		gardenState.update((state) => ({
			...state,
			workspaces: gardensData,
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
		const gardensData = await workspaceRepository.findAll()
		const firstGarden = gardensData.length > 0 ? gardensData[0] : null

		gardenState.update((state) => ({
			...state,
			workspaces: gardensData,
			currentWorkspace: firstGarden,
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
		const garden = await workspaceRepository.findById(id)

		if (garden) {
			// Update the current garden in the store
			gardenState.update((state) => ({
				...state,
				currentWorkspace: garden,
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
		const savedGarden = await workspaceRepository.save(garden)

		// Update the store
		gardenState.update((state) => {
			const index = state.workspaces.findIndex((g) => g.id === savedGarden.id)

			let updatedGardens = [...state.workspaces]
			if (index >= 0) {
				// Update existing garden
				updatedGardens[index] = savedGarden
			} else {
				// Add new garden
				updatedGardens = [...state.workspaces, savedGarden]
			}

			return {
				...state,
				workspaces: updatedGardens,
				currentWorkspace:
					state.currentWorkspace?.id === savedGarden.id
						? savedGarden
						: state.currentWorkspace,
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
		const index = state.workspaces.findIndex((g) => g.id === garden.id)

		let updatedGardens = [...state.workspaces]
		if (index >= 0) {
			// Update existing garden
			updatedGardens[index] = garden
		} else {
			// Add new garden
			updatedGardens = [...state.workspaces, garden]
		}

		return {
			...state,
			workspaces: updatedGardens,
			currentWorkspace:
				state.currentWorkspace?.id === garden.id ? garden : state.currentWorkspace,
		}
	})
}

/**
 * Add a plant to a garden zone
 */
export async function addItemToWorkspace(
	workspaceId: string,
	zoneId: string,
	item: Item,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await workspaceRepository.addItemToWorkspace(
			workspaceId,
			zoneId,
			item,
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
export async function moveItemWithinZone(
	gardenId: string,
	zoneId: string,
	itemId: string,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await workspaceRepository.moveItemWithinZone(
			gardenId,
			zoneId,
			itemId,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error moving item within zone:', error)
		throw error
	}
}

/**
 * Move a plant between zones
 */
export async function moveItemBetweenZones(
	gardenId: string,
	sourceZoneId: string,
	targetZoneId: string,
	itemId: string,
	x: number,
	y: number,
): Promise<boolean> {
	try {
		// Call repository method that updates the API
		const updatedGarden = await workspaceRepository.moveItemBetweenZones(
			gardenId,
			sourceZoneId,
			targetZoneId,
			itemId,
			x,
			y,
		)

		// Update store with response from API
		updateGardenInStore(updatedGarden)

		return true
	} catch (error) {
		console.error('Error moving item between zones:', error)
		throw error
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
		const updatedGarden = await workspaceRepository.removeItemFromZone(
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
		const updatedGarden = await workspaceRepository.cloneItem(
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
		throw error
	}
}

export default gardenState
