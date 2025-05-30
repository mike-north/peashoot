<script
	lang="ts"
	generics="TItem extends DraggableItem, ItemTooltipContentsComponent extends DraggableItemTooltipContentsComponent<TItem>"
>
import { TOOLTIP_FADEOUT_DELAY_MS } from '../../private-lib/dnd/constants'
import { onDestroy, tick, mount, unmount } from 'svelte'
import {
	type DraggableItem,
	type DraggableItemTooltipContentsComponent,
	type ExistingDraggableItem,
} from '../state/dragState'
import { colorHashToCss } from '../../lib/value-objects/color'
import TooltipCard from './TooltipCard.svelte'

// import type { PlantPlacement } from '../../lib/plant-placement' // Old type

interface Props {
	placement: ExistingDraggableItem<TItem> // Changed to ExistingGardenItem
	xPos?: number // SVG x position (renamed from x to avoid conflict with ExistingGardenItem.x)
	yPos?: number // SVG y position (renamed from y to avoid conflict with ExistingGardenItem.y)
	sizePx?: number // SVG width (cellWidth * size)
	isSourceOfPendingMoveOrClone?: boolean // New prop
	showSizeBadge?: boolean // Only show size badge if true
	TooltipContentsComponent: ItemTooltipContentsComponent
}
// Use destructured props, providing defaults
let {
	placement,
	xPos = 0,
	yPos = 0,
	sizePx = 40,
	isSourceOfPendingMoveOrClone = false,
	showSizeBadge = false,
	TooltipContentsComponent,
}: Props = $props()

const { itemData } = placement

// Use size from the core itemData using plantingDistanceInFeet
const itemSize = $derived(placement.size ?? itemData.size)
const iconDisplaySize = $derived(sizePx * 0.9)
const iconX = $derived(xPos + sizePx / 2)
const iconY = $derived(yPos + sizePx / 2)

// Tooltip state
let showTooltip = $state(false)
let tooltipTimer: ReturnType<typeof setTimeout> | null = null
let tileEl: HTMLDivElement | null = null
let tooltipPos = { left: 0, top: 0 }
let tooltipPortalEl: HTMLDivElement | null = null
let mountedTooltipCardInstance: ReturnType<typeof mount> | null = null
let tooltipHeight = 0
const pointerOffset = 8
let tooltipDirection: 'above' | 'below' = $state('above')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let tooltipVisible: boolean = $state(false)

function updateTooltipPosition() {
	if (tileEl) {
		const rect = tileEl.getBoundingClientRect()
		const scrollY = window.scrollY || window.pageYOffset
		const scrollX = window.scrollX || window.pageXOffset
		// Center tooltip horizontally, place above tile
		tooltipPos.left = rect.left + rect.width / 2 + scrollX
		// Place above the tile, accounting for tooltip height and pointer
		const offset = tooltipHeight ? tooltipHeight + pointerOffset : 32
		tooltipPos.top = rect.top + scrollY - offset
		if (tooltipPortalEl) {
			tooltipPortalEl.style.left = `${tooltipPos.left}px`
			tooltipPortalEl.style.top = `${tooltipPos.top}px`
			tooltipPortalEl.style.transform = 'translateX(-50%)'
		}
	}
}

async function showTooltipPortal() {
	await tick()

	if (mountedTooltipCardInstance) {
		unmount(mountedTooltipCardInstance).catch((err: unknown) => {
			console.warn('Error unmounting tooltip portal:', err)
		})
		mountedTooltipCardInstance = null
	}

	if (!tooltipPortalEl) {
		tooltipPortalEl = document.createElement('div')
		tooltipPortalEl.className = 'z-50 fixed flex flex-col items-center group'
		tooltipPortalEl.style.minWidth = '220px'
		tooltipPortalEl.style.maxWidth = '320px'
		document.body.appendChild(tooltipPortalEl)
	} else {
		tooltipPortalEl.innerHTML = ''
	}

	const borderWidth = 4

	const pointerOverlap = -borderWidth

	// const tooltipComponentProps = foo()
	const mountResult: ReturnType<typeof mount> = mount(TooltipCard, {
		target: tooltipPortalEl,
		props: {
			placement,
			direction: tooltipDirection,
			borderWidth,
			pointerOverlap,
			TooltipContentsComponent:
				TooltipContentsComponent as unknown as DraggableItemTooltipContentsComponent<DraggableItem>,
		},
	})

	mountedTooltipCardInstance = mountResult

	// Measure height and width
	const content = tooltipPortalEl.querySelector<HTMLElement>('.tooltip-content')
	if (!content) {
		unmount(mountedTooltipCardInstance)
			.catch((err: unknown) => {
				console.warn('Error unmounting tooltip portal:', err)
			})
			.finally(() => {
				mountedTooltipCardInstance = null
			})

		if (tooltipPortalEl.parentNode) {
			tooltipPortalEl.parentNode.removeChild(tooltipPortalEl)
			tooltipPortalEl = null
		}
		return
	}
	tooltipHeight = content.offsetHeight
	const tooltipWidth = content.offsetWidth
	if (tileEl) {
		const rect = tileEl.getBoundingClientRect()
		const scrollY = window.scrollY || window.pageYOffset
		const scrollX = window.scrollX || window.pageXOffset
		const viewportHeight = window.innerHeight
		const viewportWidth = window.innerWidth
		// Decide direction
		const spaceAbove = rect.top
		const spaceBelow = viewportHeight - rect.bottom

		const newDirection =
			spaceAbove > tooltipHeight + pointerOffset + 8 || spaceAbove > spaceBelow
				? 'above'
				: 'below'
		if (tooltipDirection !== newDirection) {
			tooltipDirection = newDirection // Update $state
			await tick() // Allow Svelte to re-render TooltipCard with new direction
		}

		// Center horizontally, but clamp if needed
		let left = rect.left + rect.width / 2 + scrollX
		let minLeft = 8 + tooltipWidth / 2
		let maxLeft = viewportWidth - 8 - tooltipWidth / 2
		if (left < minLeft) left = minLeft
		if (left > maxLeft) left = maxLeft
		// Set top
		let top
		if (tooltipDirection === 'above') {
			top = rect.top + scrollY - tooltipHeight - pointerOffset
		} else {
			top = rect.bottom + scrollY + pointerOffset
		}
		tooltipPortalEl.style.left = `${left}px`
		tooltipPortalEl.style.top = `${top}px`
		tooltipPortalEl.style.transform = 'translateX(-50%)'
	}
	// Fade in
	requestAnimationFrame(() => {
		content.style.opacity = '1'
	})

	tooltipVisible = true
}

function removeTooltipPortal() {
	console.log(
		'[removeTooltipPortal] Attempting to clean up. Instance available:',
		!!mountedTooltipCardInstance,
		'Instance (snapshot for properties):',
		JSON.stringify(Object.keys(mountedTooltipCardInstance || {})), // Log keys of the instance
	)

	if (mountedTooltipCardInstance) {
		unmount(mountedTooltipCardInstance)
			.catch((err: unknown) => {
				console.warn('Error unmounting tooltip portal:', err)
			})
			.finally(() => {
				mountedTooltipCardInstance = null
			})
	}

	if (tooltipPortalEl) {
		const portalToRemove = tooltipPortalEl // Capture for use in closure
		const content = portalToRemove.querySelector<HTMLElement>('.tooltip-content')
		if (content) {
			content.style.opacity = '0'
		}
		setTimeout(() => {
			if (portalToRemove.parentNode) {
				portalToRemove.parentNode.removeChild(portalToRemove)
			}
			// Only null out the global tooltipPortalEl if it's the one we're removing
			// and it hasn't been replaced by a new one in the meantime.
			if (tooltipPortalEl === portalToRemove) {
				tooltipPortalEl = null
			}
		}, TOOLTIP_FADEOUT_DELAY_MS)
	}
	tooltipVisible = false
}

function handleMouseEnter() {
	tooltipTimer = setTimeout(async () => {
		updateTooltipPosition()
		showTooltip = true
		window.addEventListener('scroll', updateTooltipPosition, true)
		window.addEventListener('resize', updateTooltipPosition, true)
		await showTooltipPortal()
	}, 400)
}
function handleMouseLeave() {
	if (tooltipTimer) clearTimeout(tooltipTimer)
	showTooltip = false
	window.removeEventListener('scroll', updateTooltipPosition, true)
	window.removeEventListener('resize', updateTooltipPosition, true)
	removeTooltipPortal()
}
function handleClick() {
	showTooltip = false
	window.removeEventListener('scroll', updateTooltipPosition, true)
	window.removeEventListener('resize', updateTooltipPosition, true)
	removeTooltipPortal()
}
onDestroy(() => {
	window.removeEventListener('scroll', updateTooltipPosition, true)
	window.removeEventListener('resize', updateTooltipPosition, true)
	removeTooltipPortal()
})
</script>

<style lang="scss">
@keyframes pulse-opacity {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.4;
	}
}

.plant-tile {
	position: relative;
	&.is-pending-source {
		animation: pulse-opacity 1.5s infinite;
	}

	&__icon {
		opacity: 0.8;
	}
	&__size-badge {
		position: absolute;
		top: 2px;
		right: 2px;
		font-size: 8px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 1px 3px;
		border-radius: 2px;
		z-index: 10;
		pointer-events: none;
	}
	&__background {
		fill-opacity: 0.6;
	}
}
</style>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={tileEl}
	aria-label={itemData.id}
	style="position: relative; width: 100%; height: 100%;"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclick={handleClick}
>
	<svg
		width="100%"
		height="100%"
		viewBox={`0 0 ${sizePx} ${sizePx}`}
		class="plant-tile"
		data-item-id={itemData.id}
		class:is-pending-source={isSourceOfPendingMoveOrClone}
	>
		<!-- Tile background -->
		<rect
			x={xPos}
			y={yPos}
			width={sizePx}
			height={sizePx}
			class="plant-tile__background"
			style={`fill: ${colorHashToCss(itemData.presentation.bgColor)}`}
		/>
		<!-- Plant icon -->
		{#if itemData}
			<image
				href={`plant-icons/${itemData.presentation.iconPath}`}
				x={iconX - iconDisplaySize / 2}
				y={iconY - iconDisplaySize / 2}
				width={iconDisplaySize}
				height={iconDisplaySize}
				class="plant-tile__icon"
				opacity="0.8"
			/>
		{/if}
	</svg>
	{#if showSizeBadge && itemSize > 1}
		<div class="plant-tile__size-badge">{itemSize}×{itemSize}</div>
	{/if}

	{#if showTooltip && (typeof window === 'undefined' || !document.body)}
		<!-- Fallback: render in place if no document -->
		<div
			class="z-50 absolute left-1/2 -translate-x-1/2 bottom-full mb-3 flex flex-col items-center group"
			style="min-width: 220px; max-width: 320px;"
		>
			<TooltipCard
				placement={placement}
				direction={tooltipDirection}
				borderWidth={4}
				pointerOverlap={-4}
				TooltipContentsComponent={TooltipContentsComponent}
			/>
		</div>
	{/if}
</div>
