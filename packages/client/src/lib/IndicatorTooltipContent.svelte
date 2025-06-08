<script lang="ts">
import type { IndicatorVisual } from '../private/grid/zone-layout-calculator'
import type { EffectNature } from './entities/indicator'

const { item: indicator }: { item?: Partial<IndicatorVisual> } = $props()

// Group effects by nature for better display
const effectsByNature = $derived(() => {
	const groups: Record<EffectNature, IndicatorVisual['effects']> = {
		beneficial: [],
		harmful: [],
		neutral: [],
	}

	for (const effect of indicator?.effects ?? []) {
		groups[effect.nature].push(effect)
	}

	return groups
})

// Helper function to get nature icon and color
function getNatureStyle(nature: EffectNature) {
	switch (nature) {
		case 'beneficial':
			return {
				icon: '✓',
				color: 'text-green-600',
				bg: 'bg-green-50',
				border: 'border-green-200',
			}
		case 'harmful':
			return {
				icon: '✗',
				color: 'text-red-600',
				bg: 'bg-red-50',
				border: 'border-red-200',
			}
		case 'neutral':
			return {
				icon: '○',
				color: 'text-blue-600',
				bg: 'bg-blue-50',
				border: 'border-blue-200',
			}
		default:
			return {
				icon: '?',
				color: 'text-gray-600',
				bg: 'bg-gray-50',
				border: 'border-gray-200',
			}
	}
}
</script>

<style lang="scss">
.indicator-tooltip-content {
	width: 350px;
	max-height: 400px;
	overflow-y: auto;
	font-family: sans-serif;
}

.effect-item {
	transition: all 0.15s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
}

.grid-position {
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	border: 1px solid #cbd5e1;
}
</style>

<div class="indicator-tooltip-content">
	<!-- Header -->
	<div class="mb-4">
		<div class="flex items-center gap-2 mb-2">
			<h3 class="text-lg font-semibold text-gray-800">Plant Interactions</h3>
		</div>
	</div>

	<!-- Effects by Nature -->
	<div class="space-y-3">
		{#each Object.entries(effectsByNature()) as [nature, effects] (nature)}
			{#if effects.length > 0}
				{@const style = getNatureStyle(nature as EffectNature)}
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<span class="text-lg {style.color}">{style.icon}</span>
						<h4 class="font-medium {style.color} capitalize">{nature} Effects</h4>
						<span class="text-xs {style.color} opacity-70">({effects.length})</span>
					</div>

					<div class="space-y-2">
						{#each effects as effect (effect.sourceItemTypeId + '-' + effect.targetItemTypeId)}
							<div class="effect-item {style.bg} {style.border} border rounded-lg p-3">
								<div class="flex justify-between items-start mb-2">
									<div class="text-sm font-medium text-gray-700">
										{effect.description}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
