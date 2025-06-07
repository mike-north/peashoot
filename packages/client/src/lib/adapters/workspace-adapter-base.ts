import type { Workspace } from '../entities/workspace'
import { timeout } from '../../utils/promise'
import { gardens } from '../fixture-data'

export class WorkspaceAdapterBase {
	async fetchWorkspaces(): Promise<Workspace[]> {
		await timeout(300) // Fake delay to simulate network call
		// Convert gardens to workspaces for backward compatibility
		return gardens
	}

	async fetchFirstWorkspace(): Promise<Workspace> {
		const workspaces = await this.fetchWorkspaces()
		return workspaces[0]
	}
}
