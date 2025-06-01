<script lang="ts">
import { derived } from 'svelte/store'
import CloseIcon from '~icons/ph/x-bold'
import {
	notifications,
	removeNotification,
	type NotificationType,
} from '../private/state/notificationsStore'

// Get notifications from store
const notificationsList = derived(
	notifications,
	($notifications) => $notifications.notifications,
)

// Map notification types to daisyUI alert classes
function getAlertClass(type: NotificationType): string {
	switch (type) {
		case 'error':
			return 'alert-error'
		case 'warning':
			return 'alert-warning'
		case 'info':
			return 'alert-info'
		case 'success':
			return 'alert-success'
		default:
			return 'alert-info'
	}
}

// Handle notification dismissal
function handleDismiss(id: string): void {
	removeNotification(id)
}
</script>

<style>
/* Ensure notifications always appear on top */
:global(.toast) {
	z-index: 9999 !important;
}
</style>

<!-- Show toast container only if there are notifications -->
{#if $notificationsList.length > 0}
	<div class="toast toast-top toast-end z-[9999]">
		{#each $notificationsList as notification (notification.id)}
			<div class="alert {getAlertClass(notification.type)} shadow-lg">
				<span>{notification.message}</span>
				<button
					class="btn btn-sm btn-circle btn-ghost ml-2"
					onclick={() => {
						handleDismiss(notification.id)
					}}
					aria-label="Dismiss notification"
				>
					<CloseIcon class="w-4 h-4" />
				</button>
			</div>
		{/each}
	</div>
{/if}
