<script lang="ts">
	import type { IndicatorForTooltip } from '../private/tooltips/types'
	import IdLabel from './components/IdLabel.svelte'
	import type { EffectNature } from './entities/indicator'

	const { indicator } = $props<{ indicator: IndicatorForTooltip }>()

	// Helper to get interaction type description
	function getInteractionTypeDescription(type?: string): string {
		switch (type) {
			case 'companion':
				return 'Companion Planting'
			case 'space-sharing':
				return 'Space Sharing'
			case 'resource-competition':
				return 'Resource Competition'
			case 'beneficial':
				return 'Beneficial Relationship'
			case 'competitive':
				return 'Competitive Relationship'
			default:
				return 'Plant Interaction'
		}
	}

	function getColorForEffect(nature: EffectNature): string {
		switch (nature) {
			case 'beneficial':
				return 'green'
			case 'harmful':
				return 'red'
			case 'neutral':
				return 'blue'
			default:
				return 'grey'
		}
	}
</script>

<style>
	.indicator-tooltip-content {
		width: 300px;
		padding: 12px;
		font-family: sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.title-area {
		flex-grow: 1;
	}

	.title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.description-area {
		margin-bottom: 16px;
		padding: 12px;
		background-color: #eff6ff;
		border-radius: 8px;
	}

	.description-text {
		font-size: 0.875rem;
		color: #1f2937;
		line-height: 1.6;
		margin: 0;
	}

	.details {
		border-top: 1px solid #e5e7eb;
		padding-top: 12px;
	}

	.involved-items-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 8px;
	}

	.effects {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.effect {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}

	.color-swatch {
		width: 12px;
		height: 12px;
		border-radius: 4px;
		border: 1px solid #d1d5db;
		margin-top: 4px;
		flex-shrink: 0;
	}

	.description {
		font-size: 0.875rem;
		color: #111827;
	}
</style>

<div class="indicator-tooltip-content">
	<div class="header">
		<div class="title-area">
			<h3 class="title">
				{getInteractionTypeDescription(indicator.interactionType)}
			</h3>
			<IdLabel id={indicator.id} />
		</div>
	</div>

	{#if indicator.tooltip}
		<div class="description-area">
			<p class="description-text">
				{indicator.tooltip}
			</p>
		</div>
	{/if}

	<div class="details">
		<h4 class="involved-items-title">Effects at this location</h4>
		<div class="effects">
			{#if indicator.effects}
				{#each indicator.effects as effect, i (i)}
					<div class="effect">
						<div
							class="color-swatch"
							style="background-color: {getColorForEffect(effect.nature)};"
						></div>
						<div class="description">{effect.description}</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
