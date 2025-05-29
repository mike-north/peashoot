<script lang="ts">
import type { Plant, PlantVisualPresentation } from '../../private-lib/plant'
import { dragManager } from '../../private-lib/dnd/drag-manager'
import { dragState } from '../state/dragState'
import PlantPlacementTile from './PlantPlacementTile.svelte'
import type { PlantPlacement } from '../../private-lib/plant-placement'
import { DEFAULT_LAYOUT_PARAMS } from '../../private-lib/layout-constants'
import {
	plantPlacementToExistingGardenItem,
	plantToExistingGardenItem,
} from '../state/gardenDragState'
import { clickOrHold } from '../../private-lib/actions/clickOrHold'

interface PlantToolbarProps {
	plants: Plant[]
	[k: string]: unknown
}

interface PlantToolbarPlantVariant {
	plantDisplayName: string
	iconPath: string
	presentation: PlantVisualPresentation
	plantingDistanceInFeet: number
}

interface PlantToolbarPlantFamily {
	familyDisplayName: string
	iconPath: string
	presentation: PlantVisualPresentation
	variants: PlantToolbarPlantVariant[]
}

export type { PlantToolbarPlantFamily }

const { plants, ...rest }: PlantToolbarProps = $props()

const plantListToToolbarPlantFamilies = (plants: Plant[]): PlantToolbarPlantFamily[] => {
	const plantFamilies = new Map<string, PlantToolbarPlantFamily>()
	for (const plant of plants) {
		const family = plantFamilies.get(plant.family)
		if (!family) {
			// Create a new family and add the current plant as the first variant
			plantFamilies.set(plant.family, {
				familyDisplayName: plant.family,
				iconPath: plant.presentation.tileIconPath,
				presentation: plant.presentation,
				variants: [
					{
						plantingDistanceInFeet: plant.plantingDistanceInFeet,
						plantDisplayName: plant.displayName,
						iconPath: plant.presentation.tileIconPath,
						presentation: plant.presentation,
					},
				],
			})
		} else {
			family.variants.push({
				plantingDistanceInFeet: plant.plantingDistanceInFeet,
				plantDisplayName: plant.displayName,
				iconPath: plant.presentation.tileIconPath,
				presentation: plant.presentation,
			})
		}
	}
	return Array.from(plantFamilies.values())
}

const plantFamilies = plantListToToolbarPlantFamilies(plants)

// Track selected variants for each plant family
let selectedVariants: Record<string, string> = $state(
	plantFamilies.reduce<Record<string, string>>((acc, family) => {
		acc[family.familyDisplayName] = family.variants[0].plantDisplayName
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
	const plant = createPlant(familyName, variant)
	const gardenItem = plantToExistingGardenItem(plant)
	dragManager.startDraggingNewItem(gardenItem.itemData, event)
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
	const plant = plants.find((p) => p.family === familyName && p.displayName === variant)
	if (!plant) {
		throw new Error(`Plant not found: ${familyName} ${variant}`)
	}
	return plant
}

// Create a PlantPlacement for toolbar display
function createToolbarPlantPlacement(
	familyName: string,
	variant: string,
): PlantPlacement {
	const plant = plants.find((p) => p.family === familyName && p.displayName === variant)
	if (!plant) {
		throw new Error(`Plant not found: ${familyName} ${variant}`)
	}
	return {
		id: `toolbar-${familyName}-${variant}`,
		x: 0,
		y: 0,
		plantId: plant.id,
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
		{#each plantFamilies as family (family.familyDisplayName)}
			{@const selectedVariant = selectedVariants[family.familyDisplayName]}
			{@const toolbarPlacement = createToolbarPlantPlacement(
				family.familyDisplayName,
				selectedVariant,
			)}
			{@const plant = createPlant(family.familyDisplayName, selectedVariant)}

			<div class="plant-toolbar__item">
				<!-- Main tile (selected variant) -->
				<div
					class="plant-toolbar__tile-container"
					class:plant-toolbar__tile-container--size-2={family.variants[0]
						.plantingDistanceInFeet === 2}
					class:plant-toolbar__tile-container--clickable={family.variants.length > 1}
					class:plant-toolbar__tile-container--open={openDropdown ===
						family.familyDisplayName}
					role="button"
					tabindex="0"
					use:clickOrHold={{
						onClick: () => {
							if (family.variants.length > 1) {
								toggleDropdown(family.familyDisplayName)
							}
						},
						onHold: (e) => {
							handleToolbarDrag(family.familyDisplayName, e)
						},
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							if (family.variants.length > 1) {
								toggleDropdown(family.familyDisplayName)
							} else {
								// Synthesize a mousedown event for drag initiation on keydown for single variant items
								const syntheticEvent = new MouseEvent('mousedown', {
									clientX: 0,
									clientY: 0,
									bubbles: true,
								})
								handleToolbarDrag(family.familyDisplayName, syntheticEvent)
							}
						}
					}}
				>
					<PlantPlacementTile
						plantPlacement={plantPlacementToExistingGardenItem(toolbarPlacement, plant)}
						sizePx={toolbarTileSize}
						showSizeBadge={true}
					/>

					<!-- Dropdown arrow for families with multiple variants -->
					{#if family.variants.length > 1}
						<div class="plant-toolbar__dropdown-arrow">
							{openDropdown === family.familyDisplayName ? '▲' : '▼'}
						</div>
					{/if}
				</div>

				<!-- Dropdown with variant options -->
				{#if openDropdown === family.familyDisplayName && family.variants.length > 1}
					<div class="plant-toolbar__dropdown">
						{#each family.variants as variant (variant.plantDisplayName)}
							{@const variantPlacement = createToolbarPlantPlacement(
								family.familyDisplayName,
								variant.plantDisplayName,
							)}
							{@const variantPlant = createPlant(
								family.familyDisplayName,
								variant.plantDisplayName,
							)}
							<div
								class="plant-toolbar__tile-container plant-toolbar__tile-container--variant"
								class:plant-toolbar__tile-container--size-2={variant.plantingDistanceInFeet ===
									2}
								role="button"
								tabindex="0"
								use:clickOrHold={{
									onClick: () => {
										selectVariant(family.familyDisplayName, variant.plantDisplayName)
									},
									onHold: (e) => {
										selectVariant(family.familyDisplayName, variant.plantDisplayName) // Select first, then drag
										handleToolbarDrag(family.familyDisplayName, e)
									},
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation() // Prevent main tile keydown
										selectVariant(family.familyDisplayName, variant.plantDisplayName)
									}
								}}
							>
								<PlantPlacementTile
									plantPlacement={plantPlacementToExistingGardenItem(
										variantPlacement,
										variantPlant,
									)}
									sizePx={46}
									showSizeBadge={true}
								/>
							</div>
						{/each}
					</div>
				{/if}

				<div class="plant-toolbar__label">{family.familyDisplayName}</div>
			</div>
		{/each}
	</div>
</div>

<!-- Global click handler to close dropdowns -->
<svelte:window onclick={handleClickOutside} />
