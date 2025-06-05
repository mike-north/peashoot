import type { ISeedPacket } from '@peashoot/types'

export interface SeedPacketInstructions {
	readonly sowInstructions: string
	readonly germinationInstructions: string
	readonly transplantInstructions: string
	readonly hardinessNotes: string
}

export interface SeedPacket extends ISeedPacket {
	id: string
}
