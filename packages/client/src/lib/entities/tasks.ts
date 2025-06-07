export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
	readonly id: string
	title: string
	description?: string
	dueDate?: Date
	urgency: UrgencyLevel
	completed: boolean
}

export interface TaskList {
	readonly id: string
	title: string
	tasks: Task[]
}
