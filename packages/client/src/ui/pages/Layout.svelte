<script lang="ts">
	import { Router, type RouteConfig } from '@mateothegreat/svelte5-router'
	import { defaultRouteConfig, routes as routeData } from '../../routes'

	import LayoutSidebar from '../components/LayoutSidebar.svelte'
	import LayoutTopbar from '../components/LayoutTopbar.svelte'

	const routes: RouteConfig[] = routeData.map((r) => r.forRouter)
	const topItems = routeData
		.filter((r) => !r.hideInSidebar)
		.map((r) => ({
			label: r.label,
			href: r.path,
		}))
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
				topItems
			}}
		/>

		<div class="flex h-screen min-w-0 grow flex-col overflow-auto">
			<LayoutTopbar />
			<div id="layout-content" class="grid p-6">
				<Router {routes} />
			</div>
		</div>
	</div>
</div>
