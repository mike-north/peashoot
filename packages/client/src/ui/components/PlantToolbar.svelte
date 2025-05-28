<script lang="ts">
import type { Plant } from '../../lib/plant'
import { dragManager } from '../../lib/dnd/drag-manager'
import { dragState } from '../state/dragState'
import PlantPlacementTile from './PlantPlacementTile.svelte'
import type { PlantPlacement } from '../../lib/plant-placement'
import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'
import {
	plantPlacementToExistingGardenItem,
	plantToGardenItem,
} from '../state/gardenDragState'
import { clickOrHold } from '../../lib/actions/clickOrHold'

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface PlantToolbarProps {
	[k: string]: any
}

const { ...rest }: PlantToolbarProps = $props()

// Define available plant families with their variants and properties
const plantFamilies = [
	{
		name: 'tomatoes',
		displayName: 'Tomatoes',
		icon: '🍅',
		size: 2,
		variants: [
			{ name: 'red', displayName: 'Red' },
			{ name: 'yellow', displayName: 'Yellow' },
			{ name: 'purple', displayName: 'Purple' },
		],
	},
	{
		name: 'lettuce',
		displayName: 'Lettuce',
		icon: '🥬',
		size: 1,
		variants: [
			{ name: 'green', displayName: 'Green' },
			{ name: 'red', displayName: 'Red' },
			{ name: 'purple', displayName: 'Purple' },
		],
	},
	{
		name: 'carrots',
		displayName: 'Carrots',
		icon: '🥕',
		size: 1,
		variants: [
			{ name: 'orange', displayName: 'Orange' },
			{ name: 'purple', displayName: 'Purple' },
			{ name: 'white', displayName: 'White' },
		],
	},
	{
		name: 'peppers',
		displayName: 'Peppers',
		icon: '🌶️',
		size: 1,
		variants: [
			{ name: 'red', displayName: 'Red' },
			{ name: 'green', displayName: 'Green' },
			{ name: 'yellow', displayName: 'Yellow' },
		],
	},
	{
		name: 'beans',
		displayName: 'Beans',
		icon: '🫘',
		size: 1,
		variants: [
			{ name: 'green', displayName: 'Green' },
			{ name: 'purple', displayName: 'Purple' },
			{ name: 'yellow', displayName: 'Yellow' },
		],
	},
	{
		name: 'onions',
		displayName: 'Onions',
		icon: '🧅',
		size: 1,
		variants: [
			{ name: 'white', displayName: 'White' },
			{ name: 'yellow', displayName: 'Yellow' },
			{ name: 'red', displayName: 'Red' },
		],
	},
]

// Track selected variants for each plant family
let selectedVariants: Record<string, string> = $state(
	plantFamilies.reduce<Record<string, string>>((acc, family) => {
		acc[family.name] = family.variants[0].name
		return acc
	}, {}),
)

// Track which dropdown is currently open
let openDropdown: string | null = $state(null)

// Toggle dropdown for a plant family
function toggleDropdown(familyName: string) {
	if (openDropdown === familyName) {
		openDropdown = null
	} else {
		openDropdown = familyName
	}
}

// Select a variant and close dropdown
function selectVariant(familyName: string, variantName: string) {
	selectedVariants = { ...selectedVariants, [familyName]: variantName }
	openDropdown = null
}

// Handle starting drag from toolbar
function handleToolbarDrag(familyName: string, event: MouseEvent) {
	const variant = selectedVariants[familyName]
	const family = plantFamilies.find((f) => f.name === familyName)
	if (!family) return

	const gardenItem = plantToGardenItem(createPlant(familyName, variant))
	dragManager.startDraggingNewItem(gardenItem, event)
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
	const target = event.target as Element
	if (!target.closest('.plant-toolbar__item')) {
		openDropdown = null
	}
}

// Create a plant object from family and variant
function createPlant(familyName: string, variant: string): Plant {
	const family = plantFamilies.find((f) => f.name === familyName)
	if (!family) {
		throw new Error(`Plant family not found: ${familyName}`)
	}
	return {
		id: `toolbar-${familyName}-${variant}`,
		name: family.displayName,
		icon: family.icon,
		size: family.size,
		plantFamily: {
			name: familyName,
			colorVariant: variant,
		},
	}
}

// Create a PlantPlacement for toolbar display
function createToolbarPlantPlacement(
	familyName: string,
	variant: string,
): PlantPlacement {
	return {
		id: `toolbar-${familyName}-${variant}`,
		x: 0,
		y: 0,
		plantTile: createPlant(familyName, variant),
	}
}

// Calculate tile size for toolbar (always 1x1 display, but show size indicator)
const toolbarTileSize = DEFAULT_LAYOUT_PARAMS.cellSize
</script>

<style lang="scss">
.plant-toolbar {
	background: #f8f9fa;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	/* Ensure tooltips can extend outside */
	overflow: visible;
	/* Add extra bottom margin for tooltips */
	margin-bottom: 50px;

	&__title {
		font-size: 1.2rem;
		font-weight: bold;
		color: #495057;
		margin-bottom: 12px;
		text-align: center;
	}

	&__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		// gap: 12px;
	}

	&__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		position: relative;
		/* Ensure tooltips can extend outside */
		overflow: visible;
	}

	&__tile-container {
		width: 60px;
		height: 60px;
		position: relative;
		cursor: grab;
		transition:
			transform 0.1s,
			box-shadow 0.1s;

		/* Match garden bed tile styling */
		border-radius: 6px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.13);
		border: 2px solid rgba(0, 0, 0, 0.4);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		overflow: visible; /* Allow tooltips to extend outside */

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}

		&:active {
			cursor: grabbing;
			transform: translateY(0);
		}

		&--clickable {
			cursor: pointer;

			&:hover::after {
				content: 'Click: variants • Hold: drag';
				position: absolute;
				bottom: -35px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(0, 0, 0, 0.9);
				color: white;
				padding: 6px 10px;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 500;
				white-space: nowrap;
				z-index: 10000;
				pointer-events: none;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
				animation: tooltipFadeIn 0.2s ease-out;
				animation-delay: 0.8s;
				animation-fill-mode: both;
				opacity: 0;
			}
		}

		/* Tooltip for single-variant plants */
		&:not(&--clickable):hover::after {
			content: 'Hold to drag';
			position: absolute;
			bottom: -35px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(0, 0, 0, 0.9);
			color: white;
			padding: 6px 10px;
			border-radius: 6px;
			font-size: 11px;
			font-weight: 500;
			white-space: nowrap;
			z-index: 10000;
			pointer-events: none;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			animation: tooltipFadeIn 0.2s ease-out;
			animation-delay: 0.8s;
			animation-fill-mode: both;
			opacity: 0;
		}

		&--open {
			border-color: #007bff;
			box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
		}

		&--size-2::before {
			content: '2×2';
			position: absolute;
			top: 2px;
			right: 2px;
			font-size: 8px;
			background: rgba(0, 0, 0, 0.7);
			color: white;
			padding: 1px 3px;
			border-radius: 2px;
			z-index: 10;
		}

		&--variant {
			width: 50px;
			height: 50px;
			margin: 2px 0;
			cursor: pointer;

			&:hover {
				transform: scale(1.05);
				border-color: #007bff;
			}

			&:hover::after {
				content: 'Click: select • Hold: drag';
				position: absolute;
				bottom: -35px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(0, 0, 0, 0.9);
				color: white;
				padding: 6px 10px;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 500;
				white-space: nowrap;
				z-index: 10001;
				pointer-events: none;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
				animation: tooltipFadeIn 0.2s ease-out;
				animation-delay: 0.8s;
				animation-fill-mode: both;
				opacity: 0;
			}
		}
	}

	&__label {
		font-size: 0.8rem;
		font-weight: 500;
		color: #6c757d;
		text-align: center;
	}

	&__dropdown {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		padding: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		min-width: 70px;

		&::before {
			content: '';
			position: absolute;
			top: -6px;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 6px solid transparent;
			border-right: 6px solid transparent;
			border-bottom: 6px solid #e9ecef;
		}

		&::after {
			content: '';
			position: absolute;
			top: -4px;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 4px solid transparent;
			border-right: 4px solid transparent;
			border-bottom: 4px solid white;
		}
	}

	&__dropdown-arrow {
		position: absolute;
		bottom: 2px;
		right: 2px;
		font-size: 8px;
		color: rgba(0, 0, 0, 0.6);
		pointer-events: none;
	}
}

.dragging {
	.plant-toolbar__tile-container {
		pointer-events: none;
		opacity: 0.5;
	}
}

@keyframes tooltipFadeIn {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(5px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}
</style>

<div
	{...rest}
	class="plant-toolbar {rest.class}"
	class:dragging={$dragState.draggedNewItem !== null}
>
	<div class="plant-toolbar__title">Plant Toolbar</div>
	<div class="plant-toolbar__grid">
		{#each plantFamilies as family (family.name)}
			{@const selectedVariant = selectedVariants[family.name]}
			{@const toolbarPlacement = createToolbarPlantPlacement(
				family.name,
				selectedVariant,
			)}

			<div class="plant-toolbar__item">
				<!-- Main tile (selected variant) -->
				<div
					class="plant-toolbar__tile-container"
					class:plant-toolbar__tile-container--size-2={family.size === 2}
					class:plant-toolbar__tile-container--clickable={family.variants.length > 1}
					class:plant-toolbar__tile-container--open={openDropdown === family.name}
					role="button"
					tabindex="0"
					use:clickOrHold={{
						onClick: () => {
							if (family.variants.length > 1) {
								toggleDropdown(family.name)
							}
						},
						onHold: (e) => {
							handleToolbarDrag(family.name, e)
						},
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							if (family.variants.length > 1) {
								toggleDropdown(family.name)
							} else {
								// Synthesize a mousedown event for drag initiation on keydown for single variant items
								const syntheticEvent = new MouseEvent('mousedown', {
									clientX: 0,
									clientY: 0,
									bubbles: true,
								})
								handleToolbarDrag(family.name, syntheticEvent)
							}
						}
					}}
				>
					<PlantPlacementTile
						plantPlacement={plantPlacementToExistingGardenItem(toolbarPlacement)}
						sizePx={toolbarTileSize}
					/>

					<!-- Dropdown arrow for families with multiple variants -->
					{#if family.variants.length > 1}
						<div class="plant-toolbar__dropdown-arrow">
							{openDropdown === family.name ? '▲' : '▼'}
						</div>
					{/if}
				</div>

				<!-- Dropdown with variant options -->
				{#if openDropdown === family.name && family.variants.length > 1}
					<div class="plant-toolbar__dropdown">
						{#each family.variants as variant (variant.name)}
							{@const variantPlacement = createToolbarPlantPlacement(
								family.name,
								variant.name,
							)}
							<div
								class="plant-toolbar__tile-container plant-toolbar__tile-container--variant"
								class:plant-toolbar__tile-container--size-2={family.size === 2}
								role="button"
								tabindex="0"
								use:clickOrHold={{
									onClick: () => {
										selectVariant(family.name, variant.name)
									},
									onHold: (e) => {
										selectVariant(family.name, variant.name) // Select first, then drag
										handleToolbarDrag(family.name, e)
									},
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation() // Prevent main tile keydown
										selectVariant(family.name, variant.name)
									}
								}}
							>
								<PlantPlacementTile
									plantPlacement={plantPlacementToExistingGardenItem(variantPlacement)}
									sizePx={46}
								/>
							</div>
						{/each}
					</div>
				{/if}

				<div class="plant-toolbar__label">{family.displayName}</div>
			</div>
		{/each}
	</div>
</div>

<!-- Global click handler to close dropdowns -->
<svelte:window onclick={handleClickOutside} />
