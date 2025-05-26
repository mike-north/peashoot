export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
	id: string
	title: string
	description?: string
	dueDate?: Date
	urgency: UrgencyLevel
	completed: boolean
}

export interface TaskList {
	id: string
	title: string
	tasks: Task[]
}
