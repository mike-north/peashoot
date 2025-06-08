import { writable, derived } from 'svelte/store'
import type { SeedPacket } from '../../lib/entities/seed-packet'
import { SeedPacketRepository } from '../../lib/repositories'

interface SeedPacketsState {
	seedPackets: SeedPacket[]
	loading: boolean
	error: string | null
}

const seedPacketRepository = new SeedPacketRepository()

const initialState: SeedPacketsState = {
	seedPackets: [],
	loading: true,
	error: null,
}

// Create the writable store
const seedPacketsState = writable<SeedPacketsState>(initialState)

// Derived stores for convenience
export const seedPackets = derived(seedPacketsState, ($state) => $state.seedPackets)
export const seedPacketsLoading = derived(seedPacketsState, ($state) => $state.loading)
export const seedPacketsError = derived(seedPacketsState, ($state) => $state.error)
export const seedPacketsReady = derived(
	seedPacketsState,
	($state) => !$state.loading && $state.error === null,
)

// Function to load seed packets
export async function loadSeedPackets(): Promise<void> {
	seedPacketsState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const seedPacketsData = await seedPacketRepository.findAll()
		seedPacketsState.update((state) => ({
			...state,
			seedPackets: seedPacketsData,
			loading: false,
			error: null,
		}))
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to load seed packets'
		seedPacketsState.update((state) => ({
			...state,
			loading: false,
			error: errorMessage,
		}))
		console.error('Error loading seed packets:', error)
	}
}

// Function to get a seed packet by ID
export const getSeedPacketById = derived(seedPackets, ($seedPackets) => {
	return (id: string): SeedPacket | undefined => {
		return $seedPackets.find((seedPacket) => seedPacket.id === id)
	}
})

// Add ability to get a seed packet directly from the repository
export async function fetchSeedPacketById(id: string): Promise<SeedPacket | null> {
	return seedPacketRepository.findById(id)
}

// Add ability to save a seed packet
export async function saveSeedPacket(seedPacket: SeedPacket): Promise<SeedPacket> {
	const savedSeedPacket = await seedPacketRepository.save(seedPacket)

	// Update the store with the newly saved seed packet
	seedPacketsState.update((state) => {
		const index = state.seedPackets.findIndex((sp) => sp.id === savedSeedPacket.id)

		if (index >= 0) {
			// Update existing seed packet
			const updatedSeedPackets = [...state.seedPackets]
			updatedSeedPackets[index] = savedSeedPacket
			return { ...state, seedPackets: updatedSeedPackets }
		} else {
			// Add new seed packet
			return { ...state, seedPackets: [...state.seedPackets, savedSeedPacket] }
		}
	})

	return savedSeedPacket
}

// Add ability to delete a seed packet
export async function deleteSeedPacket(id: string): Promise<boolean> {
	const success = await seedPacketRepository.delete(id)

	if (success) {
		// Remove the deleted seed packet from the store
		seedPacketsState.update((state) => ({
			...state,
			seedPackets: state.seedPackets.filter((sp) => sp.id !== id),
		}))
	}

	return success
}

// Auto-load seed packets when the store is created
loadSeedPackets().catch((error: unknown) => {
	console.error('Error loading seed packets:', error)
})

export default seedPacketsState
