<script lang="ts">
import SeedPacket from '../components/SeedPacket.svelte'
import PageTitle from '../components/PageTitle.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'

const { route }: { route: RouteResult } = $props()
</script>

<PageTitle {route} />

<div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
	<SeedPacket />
</div>
