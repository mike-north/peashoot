import { writable, derived } from 'svelte/store'
import { SeedPacketRepository } from '../../lib/repositories'
import type { SeedPacket } from '@peashoot/types'

interface SeedPacketsState {
	seedPackets: SeedPacket[]
}

const seedPacketRepository = new SeedPacketRepository()

const initialState: SeedPacketsState = {
	seedPackets: [],
}

export function setSeedPackets(seedPackets: SeedPacket[]) {
	seedPacketsState.update((state) => ({ ...state, seedPackets }))
}

// Create the writable store
const seedPacketsState = writable<SeedPacketsState>(initialState)

// Derived stores for convenience
export const seedPackets = derived(seedPacketsState, ($state) => $state.seedPackets)

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

export default seedPacketsState
