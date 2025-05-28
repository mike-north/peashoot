<script lang="ts">
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import type { PeashootRouteInfo } from '../../routes'

const {
	route,
	...rest
}: {
	route: RouteResult
	[k: string]: any
} = $props()
const routeInfo = route.route?.props?.routeInfo as PeashootRouteInfo | undefined
</script>

<h1 {...rest} class="text-4xl font-bold text-primary mb-4 mt-4 {rest.class}">
	{routeInfo?.label}
</h1>
