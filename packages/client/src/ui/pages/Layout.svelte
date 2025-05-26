<script lang="ts">
	import { Router, type RouteConfig } from '@mateothegreat/svelte5-router'
	import { defaultRouteConfig, routes as routeData } from '../../routes'
	//isSmallScreen store import removed

	import LayoutSidebar from '../components/LayoutSidebar.svelte'
	import LayoutTopbar from '../components/LayoutTopbar.svelte'

	const routes: RouteConfig[] = routeData.map((r) => r.forRouter)
	// topItems is no longer passed to LayoutSidebar, it manages its own menu items
	// const topItems = routeData
	// 	.filter((r) => !r.hideInSidebar)
	// 	.map((r) => ({
	// 		label: r.label,
	// 		href: r.path,
	// 	}))
</script>

<div class="size-full">
	<div class="flex h-full">
		<LayoutSidebar />

		<div class="flex h-full min-w-0 grow flex-col overflow-auto pt-16">
			<div id="layout-content" class="grid flex-1 p-6">
				<Router {routes} />
			</div>
		</div>
	</div>
</div>
