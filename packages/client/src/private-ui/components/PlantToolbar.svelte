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
/* Only keep custom styles for pseudo-elements and animation */
.plant-toolbar__tile-container--size-2::before {
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
.plant-toolbar__dropdown {
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
	class={`plant-toolbar overflow-visible mb-6 ${typeof rest.class === 'string' ? rest.class : ''} ${$dragState.draggedNewItem !== null ? 'dragging' : ''}`}
>
	<div
		class="plant-toolbar__grid grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-1"
	>
		{#each plantFamilies as family (family.familyDisplayName)}
			{@const selectedVariant = selectedVariants[family.familyDisplayName]}
			{@const toolbarPlacement = createToolbarPlantPlacement(
				family.familyDisplayName,
				selectedVariant,
			)}
			{@const plant = createPlant(family.familyDisplayName, selectedVariant)}

			<div
				class="plant-toolbar__item flex flex-col items-center gap-1 relative overflow-visible"
			>
				<!-- Main tile (selected variant) -->
				<div
					class={`plant-toolbar__tile-container relative w-[60px] h-[60px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-grab transition-transform transition-shadow duration-100 overflow-visible
					${family.variants[0].plantingDistanceInFeet === 2 ? 'plant-toolbar__tile-container--size-2' : ''}
					${family.variants.length > 1 ? 'plant-toolbar__tile-container--clickable cursor-pointer' : ''}
					${openDropdown === family.familyDisplayName ? 'plant-toolbar__tile-container--open border-blue-500 shadow-lg' : ''}`}
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
						<div
							class="plant-toolbar__dropdown-arrow absolute bottom-1 right-1 text-[8px] text-black/60 pointer-events-none"
						>
							{openDropdown === family.familyDisplayName ? '▲' : '▼'}
						</div>
					{/if}
				</div>

				<!-- Dropdown with variant options -->
				{#if openDropdown === family.familyDisplayName && family.variants.length > 1}
					<div
						class="plant-toolbar__dropdown absolute top-full left-1/2 -translate-x-1/2 bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg z-[1000] flex flex-col items-center gap-1 min-w-[70px]"
					>
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
								class={`plant-toolbar__tile-container plant-toolbar__tile-container--variant relative w-[50px] h-[50px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-pointer transition-transform transition-shadow duration-100 overflow-visible
								${variant.plantingDistanceInFeet === 2 ? 'plant-toolbar__tile-container--size-2' : ''}`}
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

				<div class="plant-toolbar__label text-xs font-medium text-gray-500 text-center">
					{family.familyDisplayName}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Global click handler to close dropdowns -->
<svelte:window onclick={handleClickOutside} />
