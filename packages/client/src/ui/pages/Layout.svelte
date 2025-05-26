<script lang="ts">
	import { Router, type RouteConfig } from '@mateothegreat/svelte5-router'
	import { routes as routeData } from '../../routes'

	import LayoutSidebar from '../components/LayoutSidebar.svelte'

	const routes: RouteConfig[] = routeData.map(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		(r) => r.forRouter as unknown as RouteConfig,
	)
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
