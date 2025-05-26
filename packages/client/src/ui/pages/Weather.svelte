<script lang="ts">
	import DailyForecastCard from '../components/DailyForecastCard.svelte'

	// Define more specific types for the forecast data to match component props
	type WeatherCondition =
		| 'sunny'
		| 'partlyCloudy'
		| 'rainy'
		| 'showers'
		| 'cloudy'
		| 'frosty'
		| 'snowy'
	type FrostLikelihood = 'High' | 'Medium' | 'Low' | 'None'

	interface DailyForecast {
		date: string
		day: string
		weatherCondition: WeatherCondition
		airTempHigh: number
		airTempLow: number
		soilTemp: number
		precipitationChance: number
		precipitationAmount: string
		frostLikelihood: FrostLikelihood
	}

	// Placeholder data - in a real application, this would come from an API
	const tenDayForecast: DailyForecast[] = [
		{
			date: 'Apr 10',
			day: 'Wed',
			weatherCondition: 'sunny',
			airTempHigh: 15,
			airTempLow: 5,
			soilTemp: 8,
			precipitationChance: 10,
			precipitationAmount: '0mm',
			frostLikelihood: 'Low',
		},
		{
			date: 'Apr 11',
			day: 'Thu',
			weatherCondition: 'partlyCloudy',
			airTempHigh: 16,
			airTempLow: 6,
			soilTemp: 9,
			precipitationChance: 20,
			precipitationAmount: '<1mm',
			frostLikelihood: 'Low',
		},
		{
			date: 'Apr 12',
			day: 'Fri',
			weatherCondition: 'rainy',
			airTempHigh: 12,
			airTempLow: 7,
			soilTemp: 9,
			precipitationChance: 80,
			precipitationAmount: '5-10mm',
			frostLikelihood: 'None',
		},
		{
			date: 'Apr 13',
			day: 'Sat',
			weatherCondition: 'showers',
			airTempHigh: 14,
			airTempLow: 4,
			soilTemp: 8,
			precipitationChance: 60,
			precipitationAmount: '1-3mm',
			frostLikelihood: 'Medium',
		},
		{
			date: 'Apr 14',
			day: 'Sun',
			weatherCondition: 'sunny',
			airTempHigh: 17,
			airTempLow: 5,
			soilTemp: 10,
			precipitationChance: 5,
			precipitationAmount: '0mm',
			frostLikelihood: 'Low',
		},
		{
			date: 'Apr 15',
			day: 'Mon',
			weatherCondition: 'cloudy',
			airTempHigh: 13,
			airTempLow: 6,
			soilTemp: 9,
			precipitationChance: 30,
			precipitationAmount: '<1mm',
			frostLikelihood: 'None',
		},
		{
			date: 'Apr 16',
			day: 'Tue',
			weatherCondition: 'frosty', // Changed from icon to condition
			airTempHigh: 10,
			airTempLow: 0,
			soilTemp: 6,
			precipitationChance: 10,
			precipitationAmount: '0mm',
			frostLikelihood: 'High',
		},
		{
			date: 'Apr 17',
			day: 'Wed',
			weatherCondition: 'sunny',
			airTempHigh: 12,
			airTempLow: 2,
			soilTemp: 7,
			precipitationChance: 5,
			precipitationAmount: '0mm',
			frostLikelihood: 'Medium',
		},
		{
			date: 'Apr 18',
			day: 'Thu',
			weatherCondition: 'partlyCloudy',
			airTempHigh: 15,
			airTempLow: 4,
			soilTemp: 8,
			precipitationChance: 15,
			precipitationAmount: '0mm',
			frostLikelihood: 'Low',
		},
		{
			date: 'Apr 19',
			day: 'Fri',
			weatherCondition: 'rainy',
			airTempHigh: 13,
			airTempLow: 7,
			soilTemp: 9,
			precipitationChance: 70,
			precipitationAmount: '3-7mm',
			frostLikelihood: 'None',
		},
	]

	const seasonalTrends = {
		expectedLastFrost: 'Late April / Early May',
		averageRainfallNextMonth: '50-70mm',
		temperatureTrend: 'Gradual warming, with occasional cool spells.',
		soilTemperatureTrend:
			'Steadily increasing, suitable for early planting of hardy crops by late April.',
	}

	const transplantingTimeline = [
		{
			id: 'prep_seedlings',
			time_indicator: 'Current Focus',
			estimatedDate: 'Ongoing (e.g., Apr 10+)', // Assuming today is around Apr 10 for placeholder
			title: 'Indoor Seedling Check',
			description:
				'Ensure seedlings are robust, with strong root systems and 2-3 sets of true leaves. Continue providing optimal light and water indoors.',
			icon: '🌱',
		},
		{
			id: 'hardening_off_start',
			time_indicator: 'Approx. 10-14 Days Before Last Frost',
			estimatedDate: 'Around Apr 18 - Apr 22',
			title: 'Begin Hardening Off',
			description: `Start acclimatizing tender seedlings to outdoor conditions. Begin with a few hours in a sheltered spot, gradually increasing exposure. (Target: Late April based on trends).`,
			icon: '🌤️',
		},
		{
			id: 'hardening_off_increase',
			time_indicator: 'Approx. 7 Days Before Last Frost',
			estimatedDate: 'Around Apr 23 - Apr 27',
			title: 'Increase Outdoor Exposure',
			description:
				'Continue hardening off, extending time outdoors and exposure to sun/wind. Monitor closely for any signs of stress like wilting or leaf scorch.',
			icon: '🌬️',
		},
		{
			id: 'bed_preparation',
			time_indicator: '1-2 Days Before Transplanting',
			estimatedDate: 'Around Apr 29 - Apr 30',
			title: 'Prepare Garden Beds',
			description:
				'Amend soil with compost. Ensure beds are weed-free and soil is loosened. Water seedlings well the day before transplanting.',
			icon: '🛠️',
		},
		{
			id: 'transplant_day',
			time_indicator: 'Target: After Last Frost & Soil >10°C',
			estimatedDate: 'Early May (e.g., May 1-5)',
			title: 'Transplanting Day',
			description:
				'Choose an overcast day or late afternoon. Gently transplant seedlings, disturbing roots as little as possible. Water thoroughly.',
			icon: '🪴',
		},
		{
			id: 'post_transplant_care',
			time_indicator: 'First Week After Transplant',
			estimatedDate: 'Starting Early May',
			title: 'Post-Transplant Care',
			description:
				'Monitor for transplant shock. Provide temporary shade or wind protection if necessary. Ensure consistent moisture.',
			icon: '💧',
		},
	]
</script>

<div class="container mx-auto p-4 space-y-8">
	<header class="text-center">
		<h1 class="text-4xl font-bold text-primary">Spring Weather Outlook for Your Farm</h1>
		<p class="text-lg text-neutral-content">Planning for a successful growing season.</p>
	</header>

	<section>
		<h2 class="text-3xl font-semibold mb-4 text-secondary">10-Day Forecast</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
			{#each tenDayForecast as dayForecast (dayForecast.date)}
				<DailyForecastCard
					date={dayForecast.date}
					dayOfWeek={dayForecast.day}
					weatherCondition={dayForecast.weatherCondition}
					airTempHigh={dayForecast.airTempHigh}
					airTempLow={dayForecast.airTempLow}
					soilTemp={dayForecast.soilTemp}
					precipitationChance={dayForecast.precipitationChance}
					precipitationAmount={dayForecast.precipitationAmount}
					frostLikelihood={dayForecast.frostLikelihood}
				/>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="text-3xl font-semibold mb-4 text-accent">Seasonal Trends & Insights</h2>
		<div class="stats stats-vertical lg:stats-horizontal shadow w-full">
			<div class="stat">
				<div class="stat-figure text-secondary">
					<span class="text-3xl">❄️</span>
				</div>
				<div class="stat-title">Expected Last Frost</div>
				<div class="stat-value text-2xl">{seasonalTrends.expectedLastFrost}</div>
				<div class="stat-desc">Based on historical averages.</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-info">
					<span class="text-3xl">💧</span>
				</div>
				<div class="stat-title">Avg. Rainfall (Next 30 Days)</div>
				<div class="stat-value text-2xl">{seasonalTrends.averageRainfallNextMonth}</div>
				<div class="stat-desc">Crucial for early growth.</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-warning">
					<span class="text-3xl">🌡️</span>
				</div>
				<div class="stat-title">Air Temperature Trend</div>
				<div class="stat-value text-xl whitespace-normal">
					{seasonalTrends.temperatureTrend}
				</div>
				<div class="stat-desc">Monitor daily fluctuations.</div>
			</div>
			<div class="stat">
				<div class="stat-figure text-success">
					<span class="text-3xl">🌱</span>
				</div>
				<div class="stat-title">Soil Temperature Trend</div>
				<div class="stat-value text-xl whitespace-normal">
					{seasonalTrends.soilTemperatureTrend}
				</div>
				<div class="stat-desc">Key for germination timing.</div>
			</div>
		</div>
		<div class="mt-6 p-4 bg-base-200 rounded-lg shadow">
			<h3 class="text-xl font-semibold mb-2">Gardener's Notes & Recommendations:</h3>
			<ul class="list-disc list-inside space-y-2 text-base-content">
				<li class="flex items-start">
					<span class="text-xl mr-2 text-info">🛡️</span>
					<div>
						<strong>Frost Protection:</strong> Have frost cloths ready, especially around {tenDayForecast.find(
							(d) => d.frostLikelihood === 'High',
						)?.date || 'mid-April'} if current trends hold. Pay attention to nights with clear
						skies and low wind.
					</div>
				</li>
				<li class="flex items-start">
					<span class="text-xl mr-2 text-success">🪴</span>
					<div>
						<strong>Planting:</strong> Consider starting hardy seedlings indoors. Delay planting
						sensitive crops until consistent soil temperatures above 10-12°C and after the
						last expected frost.
					</div>
				</li>
				<li class="flex items-start">
					<span class="text-xl mr-2 text-blue-400">💧</span>
					<div>
						<strong>Watering:</strong> Monitor rainfall. Ensure even moisture for newly sown
						seeds and transplants, especially if rainfall is below average.
					</div>
				</li>
				<li class="flex items-start">
					<span class="text-xl mr-2 text-yellow-600">🧤</span>
					<div>
						<strong>Soil Preparation:</strong> Good soil drainage is key, especially with expected
						spring rains. Amend soil as needed before extensive planting.
					</div>
				</li>
			</ul>
		</div>
	</section>

	<section>
		<h2 class="text-3xl font-semibold mb-6 text-info">Seedling Transplanting Timeline</h2>
		<ul class="timeline timeline-vertical">
			{#each transplantingTimeline as item, index (item.id)}
				<li>
					{#if index !== 0}
						<hr />
					{/if}
					<div class="timeline-start">
						<div class="text-sm font-semibold text-accent">{item.estimatedDate}</div>
						<time class="font-mono italic text-xs">{item.time_indicator}</time>
					</div>
					<div class="timeline-middle">
						<span class="text-2xl bg-base-300 p-1 rounded-full">{item.icon}</span>
					</div>
					<div class="timeline-end timeline-box mb-10">
						<div class="text-lg font-black text-primary">{item.title}</div>
						<p>{item.description}</p>
					</div>
					{#if index !== transplantingTimeline.length - 1}
						<hr />
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<footer
		class="text-center text-sm text-neutral-content/70 mt-12 py-4 border-t border-base-300"
	>
		<p>
			Weather data is illustrative. Always consult multiple reliable sources for critical
			farming decisions.
		</p>
		<p>&copy; {new Date().getFullYear()} Peashoot Farm Planner</p>
	</footer>
</div>

<span class="text-2xl font-bold">Weather</span>
