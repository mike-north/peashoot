<script lang="ts">
import PageTitle from '../components/PageTitle.svelte'

const { route } = $props()
</script>

<PageTitle route={route} />

<div class="container mx-auto p-4 space-y-8">
	<header class="text-center">
		<h1 class="text-4xl font-bold text-primary">C</h1>
		<p class="text-lg text-neutral-content">Planning for a successful growing season.</p>
	</header>

	<section>
		<h2 class="text-3xl font-semibold mb-4 text-secondary">10-Day Forecast</h2>
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
		></div>
	</section>
</div>
