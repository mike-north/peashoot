import type { RGB } from '../color'
import type { BaseEntity } from './base-entity'

export interface SeedPacketInstructions {
	readonly sowInstructions: string
	readonly germinationInstructions: string
	readonly transplantInstructions: string
	readonly hardinessNotes: string
}

export interface SeedPacket extends BaseEntity<'seedp'> {
	readonly id: `seedp_${string}`
	readonly displayName: string
	readonly seedCount: number
	readonly iconPath: string
	readonly accentColor: RGB
	readonly netWeightGrams: number
	readonly originLocation: string
	readonly description: string
	readonly instructions: SeedPacketInstructions
	readonly daysToHarvest: number
	readonly yieldNotes: string
}
