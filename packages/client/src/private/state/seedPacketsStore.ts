import { writable, derived } from 'svelte/store'
import type { SeedPacket } from '../../lib/entities/seed-packet'
import { SeedPacketAdapter } from '../../lib/adapters/seed-packet-adapter'

interface SeedPacketsState {
	seedPackets: SeedPacket[]
	loading: boolean
	error: string | null
}

const seedPacketAdapter = new SeedPacketAdapter()

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

// Function to load plants
export async function loadSeedPackets(): Promise<void> {
	seedPacketsState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const seedPacketsData = await seedPacketAdapter.fetchSeedPackets()
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

// Function to get a plant by ID
export const getSeedPacketById = derived(seedPackets, ($seedPackets) => {
	return (id: string): SeedPacket | undefined => {
		return $seedPackets.find((seedPacket) => seedPacket.id === id)
	}
})

// Auto-load seed packets when the store is created
loadSeedPackets().catch((error: unknown) => {
	console.error('Error loading seed packets:', error)
})

export default seedPacketsState
