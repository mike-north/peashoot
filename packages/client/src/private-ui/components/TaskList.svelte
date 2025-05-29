<script lang="ts">
import type { Task, TaskList, UrgencyLevel } from '../../private-lib/types/tasks'
import CheckCircle from '~icons/ph/check-circle-duotone'
import Circle from '~icons/ph/circle-duotone'
import Calendar from '~icons/ph/calendar-duotone'
import AlertTriangle from '~icons/ph/warning-duotone'
import Fire from '~icons/ph/fire-duotone'
import Info from '~icons/ph/info-duotone'

interface Props {
	taskList: TaskList
}

let { taskList }: Props = $props()

const urgencyIcons: Record<UrgencyLevel, typeof Info> = {
	low: Info,
	medium: Calendar,
	high: AlertTriangle,
	critical: Fire,
}

const urgencyColors: Record<UrgencyLevel, string> = {
	low: 'text-info',
	medium: 'text-success',
	high: 'text-warning',
	critical: 'text-error',
}

function toggleTaskCompletion(taskId: string) {
	const task = taskList.tasks.find((t: Task) => t.id === taskId)
	if (task) {
		task.completed = !task.completed
		// In a real app, you would also persist this change
	}
}
</script>

<style>
/* You can add component-specific styles here if needed, */
/* but try to use Tailwind utility classes as much as possible. */
</style>

<div class="card bg-base-100 shadow-xl mb-6">
	<div class="card-body">
		<h2 class="card-title text-xl font-semibold mb-4">{taskList.title}</h2>
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th class="w-12"></th>
						<th>Title</th>
						<th>Description</th>
						<th>Due Date</th>
						<th>Urgency</th>
					</tr>
				</thead>
				<tbody>
					{#if taskList.tasks.length === 0}
						<tr>
							<td colspan="5" class="text-center italic py-4">No tasks in this list.</td>
						</tr>
					{/if}
					{#each taskList.tasks as task (task.id)}
						{@const IconComponent = urgencyIcons[task.urgency]}
						<tr class="hover">
							<td>
								<button
									class="btn btn-ghost btn-sm p-1"
									onclick={() => {
										toggleTaskCompletion(task.id)
									}}
									aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
								>
									{#if task.completed}
										<CheckCircle class="w-6 h-6 text-success" />
									{:else}
										<Circle class="w-6 h-6 text-base-content/50" />
									{/if}
								</button>
							</td>
							<td
								class:line-through={task.completed}
								class={task.completed ? 'text-base-content/60' : ''}
							>
								{task.title}
							</td>
							<td
								class:line-through={task.completed}
								class={task.completed ? 'text-base-content/60' : ''}
							>
								{task.description || '-'}
							</td>
							<td
								class:line-through={task.completed}
								class={task.completed ? 'text-base-content/60' : ''}
							>
								{#if task.dueDate}
									{new Date(task.dueDate).toLocaleDateString()}
								{:else}
									-
								{/if}
							</td>
							<td>
								<div class="flex items-center gap-1 {urgencyColors[task.urgency]}">
									<IconComponent class="w-5 h-5" />
									<span class="capitalize">{task.urgency}</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
