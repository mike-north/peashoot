import type { Workspace } from '../entities/workspace'
import type { Zone } from '../entities/zone'
import type { IGarden, IGardenBed, IPlantPlacement } from '@peashoot/types'
import type { GridPlacement } from '../../private/grid/grid-placement'
import type { PlantMetadata } from '../entities/plant-metadata'
import { convertPlantItem, type PlantResource } from '../adapters/plant-item-adapter'
import { Repository } from './repository.base'
import type { Item } from '../entities/item'

type PlantPlacementResource = IPlantPlacement & { id: `plcmnt_${string}` } & {
	plant: PlantResource
}

type ZoneResource = IGardenBed & {
	id: `bed_${string}`
	plantPlacements: PlantPlacementResource[]
}

type GardenResource = IGarden & {
	id: `grdn_${string}`
	beds: ZoneResource[]
}

/**
 * Repository for Garden domain entities
 * Handles data access and persistence for Garden/Workspace entities
 */
export class GardenRepository extends Repository<Workspace, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'gardens'
	}

	/**
	 * Convert plant placement from API resource to domain entity
	 */
	private convertPlantPlacement(
		zoneId: string,
		placement: PlantPlacementResource,
	): GridPlacement<Item<PlantMetadata>> {
		const plant = convertPlantItem(placement.plant)
		return {
			id: placement.id,
			x: placement.position.x,
			y: placement.position.y,
			item: plant,
			size: Math.max(1, Math.round(plant.metadata.plantingDistanceInFeet)),
			sourceZoneId: zoneId,
		}
	}

	/**
	 * Convert zone from API resource to domain entity
	 */
	private convertZone(zoneResource: ZoneResource): Zone {
		return {
			id: zoneResource.id,
			width: zoneResource.rows,
			height: zoneResource.columns,
			waterLevel: 3,
			sunLevel: 3,
			placements: zoneResource.plantPlacements.map((placement) =>
				this.convertPlantPlacement(zoneResource.id, placement),
			),
		}
	}

	protected toDomainEntity(resource: unknown): Workspace {
		const garden = resource as GardenResource
		return {
			id: garden.id,
			zones: garden.beds.map((bed) => this.convertZone(bed)),
			indicators: [],
		}
	}

	protected toResource(entity: Workspace): unknown {
		// A full implementation would need to convert the workspace back to a garden resource
		// This is a simplification and would need to be expanded for a complete implementation
		return entity
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
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/gardens/${gardenId}/zones/${zoneId}/plants`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						plant,
						position: { x, y },
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to add plant: ${response.statusText}`)
			}

			// Return the updated garden
			const updatedGarden = await this.findById(gardenId)
			if (!updatedGarden) {
				throw new Error(`Garden not found after update: ${gardenId}`)
			}

			return updatedGarden
		} catch (error) {
			console.error('Error adding plant to garden:', error)
			throw error
		}
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
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/gardens/${gardenId}/zones/${zoneId}/plants/${plantId}/position`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						position: { x, y },
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to move plant within zone: ${response.statusText}`)
			}

			// Return the updated garden
			const updatedGarden = await this.findById(gardenId)
			if (!updatedGarden) {
				throw new Error(`Garden not found after update: ${gardenId}`)
			}

			return updatedGarden
		} catch (error) {
			console.error('Error moving plant within zone:', error)
			throw error
		}
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
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/gardens/${gardenId}/plants/${plantId}/move`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sourceZoneId,
						targetZoneId,
						position: { x, y },
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to move plant between zones: ${response.statusText}`)
			}

			// Return the updated garden
			const updatedGarden = await this.findById(gardenId)
			if (!updatedGarden) {
				throw new Error(`Garden not found after update: ${gardenId}`)
			}

			return updatedGarden
		} catch (error) {
			console.error('Error moving plant between zones:', error)
			throw error
		}
	}

	/**
	 * Remove a plant from a zone
	 */
	async removePlantFromZone(
		gardenId: string,
		zoneId: string,
		plantId: string,
	): Promise<Workspace> {
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/gardens/${gardenId}/zones/${zoneId}/plants/${plantId}`,
				{
					method: 'DELETE',
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to remove plant: ${response.statusText}`)
			}

			// Return the updated garden
			const updatedGarden = await this.findById(gardenId)
			if (!updatedGarden) {
				throw new Error(`Garden not found after update: ${gardenId}`)
			}

			return updatedGarden
		} catch (error) {
			console.error('Error removing plant from zone:', error)
			throw error
		}
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
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/gardens/${gardenId}/plants/${sourcePlantId}/clone`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sourceZoneId,
						targetZoneId,
						position: { x, y },
					}),
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to clone plant: ${response.statusText}`)
			}

			// Return the updated garden
			const updatedGarden = await this.findById(gardenId)
			if (!updatedGarden) {
				throw new Error(`Garden not found after update: ${gardenId}`)
			}

			return updatedGarden
		} catch (error) {
			console.error('Error cloning plant:', error)
			throw error
		}
	}
}
