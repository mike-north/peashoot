<script lang="ts">
import {
	showError,
	showWarning,
	showInfo,
	showSuccess,
	clearAllNotifications,
} from '../state/notificationsStore'

function testError() {
	showError('This is an error notification')
}

function testWarning() {
	showWarning('This is a warning notification')
}

function testInfo() {
	showInfo('This is an info notification')
}

function testSuccess() {
	showSuccess('This is a success notification')
}

function testMultiple() {
	showError('Critical error occurred!')
	showWarning('Please check your settings')
	showInfo('Processing your request...')
	showSuccess('Operation completed successfully')
}

function clearAll() {
	clearAllNotifications()
}
</script>

<!-- Test buttons for notification system -->
<div class="card bg-base-100 shadow-xl p-4 m-4">
	<h2 class="card-title mb-4">Notification System Test</h2>
	<div class="flex flex-wrap gap-2">
		<button class="btn btn-error" onclick={testError}>Test Error</button>
		<button class="btn btn-warning" onclick={testWarning}>Test Warning</button>
		<button class="btn btn-info" onclick={testInfo}>Test Info</button>
		<button class="btn btn-success" onclick={testSuccess}>Test Success</button>
		<button class="btn btn-primary" onclick={testMultiple}>Test Multiple</button>
		<button class="btn btn-outline" onclick={clearAll}>Clear All</button>
	</div>
</div>
