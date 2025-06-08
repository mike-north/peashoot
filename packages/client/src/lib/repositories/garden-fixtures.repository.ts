import type { Workspace } from '../entities/workspace'
import type { GridPlacement } from '../../private/grid/grid-placement'
import { gardens } from '../fixture-data'
import { timeout } from '../../utils/promise'
import { updateItemPositionInZone } from '../entities/zone'
import { moveItemBetweenZonesAndCreateNewWorkspace } from '../entities/workspace'
import { type PlantMetadata } from '../entities/plant-metadata'
import { type Item } from '../entities/item'

/**
 * Repository for Garden domain entities that uses fixture data
 * Implements the same interface as GardenRepository for easy swapping
 */
export class GardenFixturesRepository {
	private localGardens: Workspace[] = [...gardens]

	constructor() {
		// Initialize with a deep copy of the fixture data
		this.localGardens = structuredClone(gardens)
	}

	/**
	 * Find all gardens
	 */
	async findAll(): Promise<Workspace[]> {
		await timeout(300) // Simulate network delay
		return structuredClone(this.localGardens)
	}

	/**
	 * Find a garden by ID
	 */
	async findById(id: string): Promise<Workspace | null> {
		await timeout(200) // Simulate network delay
		const garden = this.localGardens.find((g) => g.id === id)
		return garden ? structuredClone(garden) : null
	}

	/**
	 * Save a garden (create or update)
	 */
	async save(garden: Workspace): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const index = this.localGardens.findIndex((g) => g.id === garden.id)

		if (index >= 0) {
			// Update existing garden
			this.localGardens[index] = structuredClone(garden)
		} else {
			// Create new garden
			this.localGardens.push(structuredClone(garden))
		}

		return structuredClone(garden)
	}

	/**
	 * Delete a garden
	 */
	async delete(id: string): Promise<boolean> {
		await timeout(300) // Simulate network delay

		const index = this.localGardens.findIndex((g) => g.id === id)

		if (index >= 0) {
			this.localGardens.splice(index, 1)
			return true
		}

		return false
	}

	/**
	 * Add a plant to a garden zone
	 */
	async addPlantToGarden(
		gardenId: string,
		zoneId: string,
		plant: Item<PlantMetadata>,
		x: number,
		y: number,
	): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const garden = this.localGardens.find((g) => g.id === gardenId)

		if (!garden) {
			throw new Error(`Garden not found: ${gardenId}`)
		}

		const zone = garden.zones.find((z) => z.id === zoneId)

		if (!zone) {
			throw new Error(`Zone not found: ${zoneId}`)
		}

		// Create a new placement ID
		const placementId = `plcmnt_${Date.now()}`

		// Create a new placement
		const newPlacement: GridPlacement<Item<PlantMetadata>> = {
			id: placementId,
			x,
			y,
			size: Math.max(1, Math.round(plant.metadata.plantingDistanceInFeet)),
			item: structuredClone(plant),
			sourceZoneId: zoneId,
		}

		// Add the placement to the zone
		zone.placements.push(newPlacement)

		// Return a deep copy of the updated garden
		return structuredClone(garden)
	}

	/**
	 * Move a plant within a zone
	 */
	async movePlantWithinZone(
		gardenId: string,
		zoneId: string,
		plantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const garden = this.localGardens.find((g) => g.id === gardenId)

		if (!garden) {
			throw new Error(`Garden not found: ${gardenId}`)
		}

		const zoneIndex = garden.zones.findIndex((z) => z.id === zoneId)

		if (zoneIndex === -1) {
			throw new Error(`Zone not found: ${zoneId}`)
		}

		// Update the zone with the new position
		garden.zones[zoneIndex] = updateItemPositionInZone(
			garden.zones[zoneIndex],
			plantId,
			x,
			y,
		)

		// Return a deep copy of the updated garden
		return structuredClone(garden)
	}

	/**
	 * Move a plant between zones
	 */
	async movePlantBetweenZones(
		gardenId: string,
		sourceZoneId: string,
		targetZoneId: string,
		plantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const garden = this.localGardens.find((g) => g.id === gardenId)

		if (!garden) {
			throw new Error(`Garden not found: ${gardenId}`)
		}

		const sourceZone = garden.zones.find((z) => z.id === sourceZoneId)
		const targetZone = garden.zones.find((z) => z.id === targetZoneId)

		if (!sourceZone) {
			throw new Error(`Source zone not found: ${sourceZoneId}`)
		}

		if (!targetZone) {
			throw new Error(`Target zone not found: ${targetZoneId}`)
		}

		// Find the placement
		const placement = sourceZone.placements.find((p) => p.id === plantId)

		if (!placement) {
			throw new Error(`Plant placement not found: ${plantId}`)
		}

		// Use the utility function that correctly preserves placement IDs
		const updatedGarden = moveItemBetweenZonesAndCreateNewWorkspace(
			garden,
			sourceZoneId,
			targetZoneId,
			placement,
			x,
			y,
		)

		// Update the garden in our local array
		const gardenIndex = this.localGardens.findIndex((g) => g.id === gardenId)
		this.localGardens[gardenIndex] = updatedGarden

		// Log the move operation for debugging
		console.log(
			`Moved plant placement ${plantId} from zone ${sourceZoneId} to zone ${targetZoneId}`,
			{
				preservedId: placement.id,
				newPosition: { x, y },
			},
		)

		// Return a deep copy of the updated garden
		return structuredClone(updatedGarden)
	}

	/**
	 * Remove a plant from a zone
	 */
	async removePlantFromZone(
		gardenId: string,
		zoneId: string,
		plantId: string,
	): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const garden = this.localGardens.find((g) => g.id === gardenId)

		if (!garden) {
			throw new Error(`Garden not found: ${gardenId}`)
		}

		const zoneIndex = garden.zones.findIndex((z) => z.id === zoneId)

		if (zoneIndex === -1) {
			throw new Error(`Zone not found: ${zoneId}`)
		}

		const zone = garden.zones[zoneIndex]

		// Remove the placement from the zone
		zone.placements = zone.placements.filter((p) => p.id !== plantId)

		// Return a deep copy of the updated garden
		return structuredClone(garden)
	}

	/**
	 * Clone/duplicate a plant
	 */
	async clonePlant(
		gardenId: string,
		sourceZoneId: string,
		targetZoneId: string,
		sourcePlantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		await timeout(300) // Simulate network delay

		const garden = this.localGardens.find((g) => g.id === gardenId)

		if (!garden) {
			throw new Error(`Garden not found: ${gardenId}`)
		}

		const sourceZone = garden.zones.find((z) => z.id === sourceZoneId)
		const targetZone = garden.zones.find((z) => z.id === targetZoneId)

		if (!sourceZone) {
			throw new Error(`Source zone not found: ${sourceZoneId}`)
		}

		if (!targetZone) {
			throw new Error(`Target zone not found: ${targetZoneId}`)
		}

		// Look for the placement in two ways:
		// 1. First try direct match on placement ID
		let sourcePlacement = sourceZone.placements.find((p) => p.id === sourcePlantId)

		// 2. If not found, look for a placement containing a plant with matching ID
		if (!sourcePlacement) {
			sourcePlacement = sourceZone.placements.find((p) => p.item.id === sourcePlantId)
		}

		if (!sourcePlacement) {
			console.error(
				'Available placements:',
				sourceZone.placements.map((p) => ({
					placementId: p.id,
					itemId: p.item.id,
				})),
			)
			throw new Error(`Source plant placement not found: ${sourcePlantId}`)
		}

		// Create a new placement ID - use 'plcmnt_' prefix for consistency
		const newPlacementId = `plcmnt_${Date.now()}${Math.floor(Math.random() * 1000)}`

		// Deep clone the item to avoid modifying the original
		// structuredClone ensures all properties including metadata are preserved
		const clonedItem = structuredClone(sourcePlacement.item) as Item<PlantMetadata>

		// Create a new placement with a new ID but with the cloned plant
		const newPlacement: GridPlacement<Item<PlantMetadata>> = {
			id: newPlacementId, // New unique placement ID
			x,
			y,
			size: sourcePlacement.size,
			item: clonedItem, // Deep-cloned item
			sourceZoneId: targetZoneId,
		}

		// Add the new placement to the target zone
		targetZone.placements.push(newPlacement)

		// Return a deep copy of the updated garden
		return structuredClone(garden)
	}
}
