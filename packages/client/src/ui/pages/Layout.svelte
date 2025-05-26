<script lang="ts">
	import { Router, type RouteConfig } from '@mateothegreat/svelte5-router'

	import Garden from './Garden.svelte'
	import Home from './Home.svelte'
	import SeedCatalog from './SeedCatalog.svelte'
	import LayoutSidebar from '../components/LayoutSidebar.svelte'
	import LayoutTopbar from '../components/LayoutTopbar.svelte'

	const routes: RouteConfig[] = [
		{
			component: Home,
		},
		{
			path: 'garden',
			component: Garden,
		},
		{
			path: 'seed-catalog',
			component: SeedCatalog,
		},
	]
</script>

<div class="size-full">
	<div class="flex">
		<input
			type="checkbox"
			id="layout-sidebar-toggle-trigger"
			class="hidden"
			aria-label="Toggle layout sidebar"
		/>

		<LayoutSidebar
			menu={{
				topItems: [
					{
						label: 'Home',
						href: '/',
					},
					{
						label: 'Garden',
						href: '/garden',
					},
					{
						label: 'Seed Catalog',
						href: '/seed-catalog',
					},
				],
			}}
		/>

		<div class="flex h-screen min-w-0 grow flex-col overflow-auto">
			<LayoutTopbar />
			<div id="layout-content">
				<Router {routes} />
			</div>
		</div>
	</div>
</div>
