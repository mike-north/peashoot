<script lang="ts">
	interface Props {
		date: string
		dayOfWeek: string
		weatherCondition:
			| 'sunny'
			| 'partlyCloudy'
			| 'rainy'
			| 'showers'
			| 'cloudy'
			| 'frosty'
			| 'snowy'
		airTempHigh: number
		airTempLow: number
		soilTemp: number
		precipitationChance: number
		precipitationAmount: string
		frostLikelihood: 'High' | 'Medium' | 'Low' | 'None'
	}

	let {
		date,
		dayOfWeek,
		weatherCondition,
		airTempHigh,
		airTempLow,
		soilTemp,
		precipitationChance,
		precipitationAmount,
		frostLikelihood,
	}: Props = $props()

	function getWeatherIcon(condition: Props['weatherCondition']) {
		switch (condition) {
			case 'sunny':
				return '☀️'
			case 'partlyCloudy':
				return '⛅️'
			case 'rainy':
				return '🌧️'
			case 'showers':
				return '🌦️'
			case 'cloudy':
				return '☁️'
			case 'frosty':
			case 'snowy': // Grouping frosty and snowy for icon purposes for now
				return '❄️'
			default:
				return '❓' // Unknown
		}
	}

	function getFrostAlertClass(likelihood: Props['frostLikelihood']) {
		switch (likelihood.toLowerCase()) {
			case 'high':
				return 'text-red-500 font-bold'
			case 'medium':
				return 'text-orange-500 font-semibold'
			case 'low':
				return 'text-yellow-500'
			default:
				return 'text-green-500' // 'none' or other cases
		}
	}
</script>

<div class="card bg-base-200 shadow-xl indicator h-full">
	{#if frostLikelihood !== 'None' && frostLikelihood !== 'Low'}
		<span
			class="indicator-item indicator-top indicator-start badge {frostLikelihood ===
			'High'
				? 'badge-error'
				: 'badge-warning'}"
		>
			Frost Risk
		</span>
	{/if}
	<div class="card-body items-center text-center">
		<h3 class="card-title text-xl">{dayOfWeek}, {date}</h3>
		<div class="text-5xl my-2">{getWeatherIcon(weatherCondition)}</div>
		<p class="text-lg">
			Air: <span class="font-semibold">{airTempHigh}°C</span> / {airTempLow}°C
		</p>
		<p>Soil: <span class="font-semibold">{soilTemp}°C</span></p>
		<p>Rain: {precipitationChance}% ({precipitationAmount})</p>
		<p>
			Frost:
			<span class={getFrostAlertClass(frostLikelihood)}>
				{frostLikelihood}
			</span>
		</p>
	</div>
</div>
