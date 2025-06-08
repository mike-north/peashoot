<script lang="ts">
import { tooltipStore } from './store'
import { onMount, tick } from 'svelte'
import { scale } from 'svelte/transition'

let tooltipElement = $state<HTMLElement | null>(null)
let currentTooltipId: string | undefined

const store = tooltipStore

$effect(() => {
	const tooltip = $store

	if (tooltip && tooltip.id !== currentTooltipId) {
		currentTooltipId = tooltip.id

		const updatePosition = () => {
			// eslint-disable-next-line
			if (!tooltipElement || !tooltip.target) return

			const targetRect = tooltip.target.getBoundingClientRect()
			const tooltipRect = tooltipElement.getBoundingClientRect()

			const offset = 8
			const viewportWidth = window.innerWidth
			const viewportHeight = window.innerHeight

			const spaceAbove = targetRect.top
			const spaceBelow = viewportHeight - targetRect.bottom
			const spaceLeft = targetRect.left
			const spaceRight = viewportWidth - targetRect.right

			let orientation = 'top' // default

			if (spaceBelow >= tooltipRect.height + offset) {
				orientation = 'bottom'
			} else if (spaceAbove >= tooltipRect.height + offset) {
				orientation = 'top'
			} else if (spaceRight >= tooltipRect.width + offset) {
				orientation = 'right'
			} else if (spaceLeft >= tooltipRect.width + offset) {
				orientation = 'left'
			} else {
				const maxSpace = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft)
				if (maxSpace === spaceBelow) {
					orientation = 'bottom'
				} else if (maxSpace === spaceAbove) {
					orientation = 'top'
				} else if (maxSpace === spaceRight) {
					orientation = 'right'
				} else {
					orientation = 'left'
				}
			}

			let top = 0
			let left = 0

			switch (orientation) {
				case 'top':
					top = targetRect.top - tooltipRect.height - offset
					left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
					break
				case 'bottom':
					top = targetRect.bottom + offset
					left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
					break
				case 'left':
					top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
					left = targetRect.left - tooltipRect.width - offset
					break
				case 'right':
					top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
					left = targetRect.right + offset
					break
			}

			const minX = offset
			const maxX = viewportWidth - tooltipRect.width - offset
			const minY = offset
			const maxY = viewportHeight - tooltipRect.height - offset

			left = Math.max(minX, Math.min(left, maxX))
			top = Math.max(minY, Math.min(top, maxY))

			store.update((current) => {
				if (current?.id === tooltip.id) {
					return { ...current, position: { x: left, y: top } }
				}
				return current
			})
		}

		void tick().then(updatePosition)
	} else if (!tooltip) {
		currentTooltipId = undefined
	}
})

onMount(() => {
	const handleEvent = () => {
		if ($store) {
			store.hide($store.id)
		}
	}

	const handleClickOutside = (event: MouseEvent) => {
		if ($store) {
			const target = event.target as Element
			if (target.closest(`[data-tooltip-id="${$store.id}"]`)) {
				return
			}
			store.hide($store.id)
		}
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') handleEvent()
	}

	window.addEventListener('scroll', handleEvent, { passive: true, capture: true })
	window.addEventListener('resize', handleEvent, { passive: true })
	document.addEventListener('click', handleClickOutside, true)
	window.addEventListener('keydown', handleKeyDown)

	return () => {
		window.removeEventListener('scroll', handleEvent, { capture: true })
		window.removeEventListener('resize', handleEvent)
		document.removeEventListener('click', handleClickOutside, true)
		window.removeEventListener('keydown', handleKeyDown)
	}
})
</script>

{#if $store}
	{@const tooltip = $store}
	{@const tooltipProps = tooltip.props}
	{@const TooltipComponent = tooltip.component}
	<div
		bind:this={tooltipElement}
		class="tooltip-container bg-white border border-gray-200 rounded-lg shadow-lg p-3"
		style:position="fixed"
		style:top="{tooltip.position.y}px"
		style:left="{tooltip.position.x}px"
		style:z-index="10000"
		data-tooltip-id={tooltip.id}
		transition:scale={{ duration: 100, start: 0.95 }}
	>
		{#key tooltip.id}
			{#if tooltipProps}
				<TooltipComponent {...tooltipProps} />
			{/if}
		{/key}
	</div>
{/if}
