import type { BaseEntity } from './base-entity'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Task extends BaseEntity<'task'> {
	readonly id: `task_${string}`
	title: string
	description?: string
	dueDate?: Date
	urgency: UrgencyLevel
	completed: boolean
}

export interface TaskList extends BaseEntity<'tasklist'> {
	readonly id: `tasklist_${string}`
	title: string
	tasks: Task[]
}
