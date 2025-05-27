<script lang="ts">
	import TaskList from '../components/TaskList.svelte'
	import type { TaskList as TaskListType } from '../../lib/types/tasks'
	import Plus from '~icons/ph/plus-circle-duotone'
	import ListChecks from '~icons/ph/list-checks-bold'

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

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<span class="text-3xl font-bold">Tasks</span>
		<button class="btn btn-primary">
			<!-- Placeholder for an icon, e.g., Plus from Phosphor icons  -->
			<Plus class="w-5 h-5 mr-2" />
			Add New List
		</button>
	</div>

	{#if taskLists.length === 0}
		<div class="text-center py-10">
			<p class="text-xl text-base-content/70">
				No task lists yet. Get started by adding one!
			</p>
			<ListChecks class="w-5 h-5" />
		</div>
	{:else}
		{#each taskLists as taskList (taskList.id)}
			<TaskList taskList={taskList} />
		{/each}
	{/if}
</div>
