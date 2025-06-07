<script lang="ts">
	import { onMount } from 'svelte'
	import { tooltipStore, hideTooltip } from '../state/tooltipStore'
	import ItemTooltipContent from '../../../lib/ItemTooltipContent.svelte'
	import IndicatorTooltipContent from '../../../lib/IndicatorTooltipContent.svelte'

	onMount(() => {
		const handleScroll = () => {
			hideTooltip('')
		}
		const handleResize = () => {
			hideTooltip('')
		}
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element
			if (target.closest('.tooltip-renderer') || target.closest('[data-tooltip-id]')) {
				return
			}
			hideTooltip('')
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				hideTooltip('')
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleResize, { passive: true })
		document.addEventListener('click', handleClickOutside, true)
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)
			document.removeEventListener('click', handleClickOutside, true)
			window.removeEventListener('keydown', handleKeyDown)
		}
	})

	const store = tooltipStore
</script>

<style>
	.tooltip-renderer {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
		/* Add any other necessary styling for the tooltip container */
	}
</style>

{#if $store}
	<div
		class="tooltip-renderer"
		style="top: {$store.position.y}px; left: {$store.position.x}px;"
		data-tooltip-id={$store.id}
	>
		{#if $store.item}
			<ItemTooltipContent item={$store.item} />
		{:else if $store.indicator}
			<IndicatorTooltipContent indicator={$store.indicator} />
		{/if}
	</div>
{/if} 