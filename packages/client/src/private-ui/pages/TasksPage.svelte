<script lang="ts">
import TaskList from '../components/TaskList.svelte'
import type { TaskList as TaskListType } from '../../private-lib/types/tasks'
import Plus from '~icons/ph/plus-circle-duotone'
import ListChecks from '~icons/ph/list-checks-bold'
import PageTitle from '../components/PageTitle.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'

const { route }: { route: RouteResult } = $props()

// Sample data for demonstration
const sampleTaskLists: TaskListType[] = [
	{
		id: 'list-1',
		title: 'Personal Errands',
		tasks: [
			{
				id: 'task-1-1',
				title: 'Buy groceries',
				description: 'Milk, Bread, Eggs, Cheese',
				dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Due in 2 days
				urgency: 'medium',
				completed: false,
			},
			{
				id: 'task-1-2',
				title: 'Book doctor appointment',
				urgency: 'high',
				completed: false,
			},
			{
				id: 'task-1-3',
				title: 'Pay electricity bill',
				description: 'Around $50',
				dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Due in 5 days
				urgency: 'medium',
				completed: true,
			},
		],
	},
	{
		id: 'list-2',
		title: 'Work Projects - Q3',
		tasks: [
			{
				id: 'task-2-1',
				title: 'Finalize budget report',
				description: 'Get numbers from finance team',
				dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Due in 1 week
				urgency: 'critical',
				completed: false,
			},
			{
				id: 'task-2-2',
				title: 'Client presentation draft',
				urgency: 'high',
				completed: false,
			},
			{
				id: 'task-2-3',
				title: 'Team meeting agenda',
				description: 'Discuss Q4 roadmap',
				dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Due tomorrow
				urgency: 'low',
				completed: true,
			},
		],
	},
	{
		id: 'list-3',
		title: 'Learning TypeScript',
		tasks: [], // An empty list
	},
]

let taskLists: TaskListType[] = $state(sampleTaskLists)
</script>

<PageTitle route={route} />
<div class="container mx-auto p-6 md:p-8">
	<div class="flex justify-start items-center mb-8">
		<button class="btn btn-primary shadow-md">
			<Plus class="w-5 h-5 mr-2" />
			Add New List
		</button>
	</div>

	{#if taskLists.length === 0}
		<div class="text-center py-16 rounded-lg bg-base-100 shadow-sm">
			<ListChecks class="w-12 h-12 mx-auto mb-4 text-primary" />
			<p class="text-xl text-base-content/70 mb-2">No task lists yet.</p>
			<p class="text-md text-base-content/60">
				Get started by adding one using the button above!
			</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#each taskLists as taskList (taskList.id)}
				<TaskList taskList={taskList} />
			{/each}
		</div>
	{/if}
</div>
