import { writable } from 'svelte/store'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
	id: string
	type: NotificationType
	message: string
	autoRemove?: boolean
	duration?: number // in milliseconds
	createdAt: number
}

interface NotificationsState {
	notifications: Notification[]
}

const initialState: NotificationsState = {
	notifications: [],
}

// Create the writable store
const notificationsState = writable<NotificationsState>(initialState)

// Priority order for sorting (higher number = higher priority)
const PRIORITY_ORDER: Record<NotificationType, number> = {
	error: 4,
	warning: 3,
	info: 2,
	success: 1,
}

// Helper function to generate unique IDs
function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Helper function to sort notifications by priority
function sortNotifications(notifications: Notification[]): Notification[] {
	return notifications.sort((a, b) => {
		// First sort by priority (error > warning > info > success)
		const priorityDiff = PRIORITY_ORDER[b.type] - PRIORITY_ORDER[a.type]
		if (priorityDiff !== 0) return priorityDiff

		// If same priority, sort by creation time (newest first)
		return b.createdAt - a.createdAt
	})
}

// Function to add a notification
export function addNotification(
	type: NotificationType,
	message: string,
	options: {
		autoRemove?: boolean
		duration?: number
	} = {},
): string {
	const id = generateId()
	const { autoRemove = true, duration = type === 'error' ? 10000 : 5000 } = options

	const notification: Notification = {
		id,
		type,
		message,
		autoRemove,
		duration,
		createdAt: Date.now(),
	}

	notificationsState.update((state) => ({
		notifications: sortNotifications([...state.notifications, notification]),
	}))

	// Auto-remove if configured
	if (autoRemove && duration > 0) {
		setTimeout(() => {
			removeNotification(id)
		}, duration)
	}

	return id
}

// Function to remove a notification
export function removeNotification(id: string): void {
	notificationsState.update((state) => ({
		notifications: state.notifications.filter((n) => n.id !== id),
	}))
}

// Function to remove notifications by message
export function removeNotificationByMessage(message: string): void {
	notificationsState.update((state) => ({
		notifications: state.notifications.filter((n) => n.message !== message),
	}))
}

// Function to clear all notifications
export function clearAllNotifications(): void {
	notificationsState.update(() => ({ notifications: [] }))
}

// Convenience functions for different notification types
export function showError(
	message: string,
	options?: { autoRemove?: boolean; duration?: number },
): string {
	return addNotification('error', message, options)
}

export function showWarning(
	message: string,
	options?: { autoRemove?: boolean; duration?: number },
): string {
	return addNotification('warning', message, options)
}

export function showInfo(
	message: string,
	options?: { autoRemove?: boolean; duration?: number },
): string {
	return addNotification('info', message, options)
}

export function showSuccess(
	message: string,
	options?: { autoRemove?: boolean; duration?: number },
): string {
	return addNotification('success', message, options)
}

// Export the store for components to subscribe to
export const notifications = notificationsState
