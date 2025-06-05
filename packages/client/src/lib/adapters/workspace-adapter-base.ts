import type { Workspace } from '../entities/workspace'
import type { Garden } from '../entities/garden'
import { timeout } from '../../utils/promise'
import { gardens } from '../fixture-data'

export class WorkspaceAdapterBase {
	async fetchWorkspaces(): Promise<Workspace[]> {
		await timeout(300) // Fake delay to simulate network call
		// Convert gardens to workspaces for backward compatibility
		return gardens.map(garden => this.convertGardenToWorkspace(garden))
	}
	
	private convertGardenToWorkspace(garden: Garden): Workspace {
		return {
			id: garden.id,
			zones: garden.beds,
			edgeIndicators: garden.edgeIndicators.map(indicator => ({
				id: indicator.id,
				itemAId: indicator.plantAId,
				itemBId: indicator.plantBId,
				color: indicator.color
			}))
		}
	}
	
	async fetchFirstWorkspace(): Promise<Workspace> {
		const workspaces = await this.fetchWorkspaces()
		return workspaces[0]
	}
} 