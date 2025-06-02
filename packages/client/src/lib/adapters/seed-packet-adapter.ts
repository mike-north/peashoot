import type { SeedPacket } from '../entities/seed-packet'
import { SeedPacketAdapterBase } from './seed-packet-adapter-base'
import type { ISeedPacket } from '@peashoot/types'

async function apiCall<T>(url: string): Promise<T> {
	const response = await fetch(`http://localhost:3000/api/${url}`)
	return (await response.json()) as T
}

type SeedPacketResponse = ISeedPacket & { id: string }

export class SeedPacketAdapter extends SeedPacketAdapterBase {
	override async fetchSeedPackets(): Promise<SeedPacket[]> {
		const seedPackets = await apiCall<SeedPacketResponse[]>('seed-packets')
		return seedPackets.map<SeedPacket>((seedPacket) => ({
			...seedPacket,
			id: seedPacket.id as `seedp_${string}`,
		}))
	}
}
