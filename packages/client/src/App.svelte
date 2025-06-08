<script lang="ts">
import Layout from './pages/Layout.svelte'
import { getPlantRepository } from './lib/repositories/repository-factory'
import { getSeedPacketRepository } from './lib/repositories/repository-factory'
import { setPlants } from './lib/state/plantsStore'
import { setSeedPackets } from './lib/state/seedPacketsStore'

let isLoadingCoreData = $state(true)

const plantRepository = getPlantRepository()
const seedPacketRepository = getSeedPacketRepository()

async function loadCoreData() {
	const [plantsData, seedPacketsData] = await Promise.all([
		plantRepository.findAll(),
		seedPacketRepository.findAll(),
	])
	setPlants(plantsData)
	setSeedPackets(seedPacketsData)
	isLoadingCoreData = false
}

loadCoreData().catch((error: unknown) => {
	throw new Error('Failed to load core data', { cause: error })
})
</script>

<div class="h-screen">
	{#if isLoadingCoreData}
		<div class="flex justify-center items-center h-screen">
			<div
				class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"
			></div>
		</div>
	{:else}
		<Layout />
	{/if}
</div>
