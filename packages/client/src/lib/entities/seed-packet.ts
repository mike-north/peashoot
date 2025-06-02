import type { ISeedPacket } from '@peashoot/types'
import type { BaseEntity } from './base-entity'

export interface SeedPacketInstructions {
	readonly sowInstructions: string
	readonly germinationInstructions: string
	readonly transplantInstructions: string
	readonly hardinessNotes: string
}

export interface SeedPacket extends BaseEntity<'seedp'>, ISeedPacket {}
