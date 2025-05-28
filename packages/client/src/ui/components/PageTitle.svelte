<script lang="ts">
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import type { PeashootRouteInfo } from '../../routes'

export let route: RouteResult
const routeInfo = route.route?.props?.routeInfo as PeashootRouteInfo | undefined
</script>

<h1 class="text-4xl font-bold text-primary">{routeInfo?.label}</h1>
