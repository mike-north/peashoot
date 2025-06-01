<script lang="ts">
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import PageTitle from '../components/PageTitle.svelte'

const { route }: { route: RouteResult } = $props()
</script>

<style lang="scss">
/* Remove unused styles */
</style>

<PageTitle route={route} />
<div class="grid h-full place-items-center">
	<div class="text-center">
		<p class="mt-4">
			Check out the <a href="/seed-catalog" class="link-primary link">seed catalog</a>
			or
			<a href="/garden" class="link-primary link">garden</a>
			to get started.
		</p>
	</div>
</div>
