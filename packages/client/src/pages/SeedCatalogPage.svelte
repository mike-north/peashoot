<script lang="ts">
import SeedPacket from '../components/SeedPacket.svelte'
import PageTitle from '../components/PageTitle.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'
import { seedPackets } from '../lib/state/seed-packets.store'

const { route }: { route: RouteResult } = $props()
</script>

<PageTitle route={route} />
<div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each $seedPackets as seedPacket (seedPacket.id)}
		<SeedPacket seedPacket={seedPacket} />
	{/each}
</div>
