<script lang="ts">
import PageTitle from '../components/PageTitle.svelte'
import { onMount } from 'svelte'
import { locationTemperatureDataStore } from '../lib/state/location-temperature-data.store'
import type { Location } from '@peashoot/types'

const { route } = $props()

onMount(() => {
	void locationTemperatureDataStore.loadLocations()
})

async function handleEstimate() {
	await locationTemperatureDataStore.calculateDate()
}

function handleLocationChange(event: Event) {
	const select = event.target as HTMLSelectElement
	if (!select.value) {
		locationTemperatureDataStore.selectLocation(null)
		return
	}
	try {
		const location = JSON.parse(select.value) as Location
		locationTemperatureDataStore.selectLocation(location)
	} catch (error) {
		console.error('Failed to parse location:', error)
		locationTemperatureDataStore.selectLocation(null)
	}
}

function handleTemperatureChange(event: Event) {
	const input = event.target as HTMLInputElement
	if (input.value === '') {
		locationTemperatureDataStore.setTargetTemperature(null)
		return
	}
	const temperature = parseFloat(input.value)
	locationTemperatureDataStore.setTargetTemperature(
		isNaN(temperature) ? null : temperature,
	)
}
</script>

<PageTitle route={route} />

<div class="max-w-2xl mx-auto p-4">
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-2xl font-semibold mb-6">Temperature Date Calculator</h2>

		{#if $locationTemperatureDataStore.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
				{$locationTemperatureDataStore.error}
			</div>
		{/if}

		<div class="space-y-4">
			<div>
				<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
					Location
				</label>
				<select
					id="location"
					value={$locationTemperatureDataStore.selectedLocation
						? JSON.stringify($locationTemperatureDataStore.selectedLocation)
						: ''}
					onchange={handleLocationChange}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">Select a location</option>
					{#each $locationTemperatureDataStore.locations as location (location.id)}
						<option value={JSON.stringify(location)}>
							{location.name}, {location.region}, {location.country}
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="temperature" class="block text-sm font-medium text-gray-700 mb-1">
					Target Temperature (°{$locationTemperatureDataStore.temperatureUnit})
				</label>
				<div class="join w-full">
					<input
						type="number"
						id="temperature"
						value={$locationTemperatureDataStore.targetTemperature ?? ''}
						oninput={handleTemperatureChange}
						class="input input-bordered join-item w-full"
						placeholder="Enter temperature"
					/>
					<button
						class="btn join-item {$locationTemperatureDataStore.temperatureUnit === 'C'
							? 'btn-active'
							: ''}"
						onclick={() => {
							locationTemperatureDataStore.setTemperatureUnit('C')
						}}
					>
						°C
					</button>
					<button
						class="btn join-item {$locationTemperatureDataStore.temperatureUnit === 'F'
							? 'btn-active'
							: ''}"
						onclick={() => {
							locationTemperatureDataStore.setTemperatureUnit('F')
						}}
					>
						°F
					</button>
				</div>
			</div>

			<button
				onclick={handleEstimate}
				disabled={!$locationTemperatureDataStore.selectedLocation ||
					$locationTemperatureDataStore.targetTemperature === null ||
					$locationTemperatureDataStore.isLoading}
				class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if $locationTemperatureDataStore.isLoading}
					Calculating...
				{:else}
					Estimate Date
				{/if}
			</button>

			{#if $locationTemperatureDataStore.estimatedDate}
				<div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
					<p class="text-green-800">
						The temperature is estimated to reach {$locationTemperatureDataStore.targetTemperature}°{$locationTemperatureDataStore.temperatureUnit}
						on {$locationTemperatureDataStore.estimatedDate.toLocaleDateString()}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
