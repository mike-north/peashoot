import { Repository } from './repository.base'
import { WorkspaceSchema, type Item, type Workspace } from '@peashoot/types'

/**
 * Repository for Garden domain entities
 * Handles data access and persistence for Garden/Workspace entities
 */
export class WorkspaceRepository extends Repository<Workspace, string> {
	constructor() {
		super('http://localhost:3000/api')
	}

	protected getEndpoint(): string {
		return 'workspaces'
	}

	protected toDomainEntity(resource: unknown): Workspace {
		return WorkspaceSchema.parse(resource)
	}

	/**
	 * Add a plant to a garden zone
	 */
	async addItemToWorkspace(
		gardenId: string,
		zoneId: string,
		plant: Item,
		x: number,
		y: number,
	): Promise<Workspace> {
		console.log('addItemToWorkspace called with:', {
			gardenId,
			zoneId,
			plant,
			x,
			y,
		})
		await Promise.resolve()
		throw new Error('Not implemented')
	}

	/**
	 * Move a plant within a zone
	 */
	async moveItemWithinZone(
		gardenId: string,
		zoneId: string,
		plantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		console.log('moveItemWithinZone called with:', {
			gardenId,
			zoneId,
			plantId,
			x,
			y,
		})
		await Promise.resolve()
		throw new Error('Not implemented')
	}

	/**
	 * Move a plant between zones
	 */
	async moveItemBetweenZones(
		gardenId: string,
		sourceZoneId: string,
		targetZoneId: string,
		plantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		console.log('moveItemBetweenZones called with:', {
			gardenId,
			sourceZoneId,
			targetZoneId,
			plantId,
			x,
			y,
		})
		await Promise.resolve()
		throw new Error('Not implemented')
	}

	/**
	 * Remove a plant from a zone
	 */
	async removeItemFromZone(
		gardenId: string,
		zoneId: string,
		plantId: string,
	): Promise<Workspace> {
		console.log('removeItemFromZone called with:', {
			gardenId,
			zoneId,
			plantId,
		})
		await Promise.resolve()
		throw new Error('Not implemented')
	}

	/**
	 * Clone/duplicate a plant
	 */
	async cloneItem(
		gardenId: string,
		sourceZoneId: string,
		targetZoneId: string,
		sourcePlantId: string,
		x: number,
		y: number,
	): Promise<Workspace> {
		console.log('cloneItem called with:', {
			gardenId,
			sourceZoneId,
			targetZoneId,
			sourcePlantId,
			x,
			y,
		})
		await Promise.resolve()
		throw new Error('Not implemented')
	}
}
