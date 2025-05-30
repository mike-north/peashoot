<script lang="ts" generics="ItemType extends DraggableItem">
import { dragManager } from '../../private-lib/dnd/drag-manager'
import {
	dragState,
	type ExistingDraggableItem,
	type DraggableItem,
} from '../state/dragState'
import PlantPlacementTile from './DraggableItemPlacementTile.svelte'
import type { PlantPlacement } from '../../private-lib/plant-placement'
import {
	itemDataToExistingDraggableItem,
	plantPlacementToExistingGardenItem,
} from '../state/gardenDragState'
import { clickOrHold } from '../../private-lib/actions/clickOrHold'
import type { TilePresentation } from '../../lib/tile'
import { DEFAULT_LAYOUT_PARAMS } from '../../private-lib/layout-constants'

interface DraggableItemToolbarProps {
	dataItems: ItemType[]
	createToolbarItem: (item: ItemType) => ToolbarItem
	createDataItem: (item: ToolbarItem) => ItemType
	getCategoryFromDataItem: (item: ItemType) => string
	[k: string]: unknown
}

interface ToolbarItem {
	displayName: string
	iconPath: string
	presentation: TilePresentation
	size: number
	category: string
	itemData: ItemType
}

interface ToolbarItemCategory {
	displayName: string
	selectedItem: ToolbarItem
	items: ToolbarItem[]
}

const {
	dataItems,
	createToolbarItem,
	createDataItem,
	getCategoryFromDataItem,
	...rest
}: DraggableItemToolbarProps = $props()
const toolbarItems: ToolbarItem[] = $derived(dataItems.map(createToolbarItem))

const itemListToCategoryList = (items: ToolbarItem[]): ToolbarItemCategory[] => {
	const categories = new Map<string, ToolbarItemCategory>()
	for (const item of items) {
		const category = categories.get(item.category)
		// deep copy, just to make sure it can't be mutated
		const itemCopy = { ...item }
		if (!category) {
			// Create a new category and add the current item as the first item in the category
			categories.set(item.category, {
				displayName: item.category,
				selectedItem: itemCopy,
				items: [itemCopy],
			})
		} else {
			category.items.push(itemCopy)
		}
	}
	return Array.from(categories.values())
}

const itemCategories: ToolbarItemCategory[] = $derived(
	itemListToCategoryList(toolbarItems),
)

// Track selected item for each category
let selectedCategoryItems: Record<string, ToolbarItem> = $derived(
	itemCategories.reduce<Record<string, ToolbarItem>>((acc, category) => {
		acc[category.displayName] = category.items[0]
		return acc
	}, {}),
)

// Track which dropdown is currently open
let openDropdown: string | null = $state(null)

// Toggle dropdown for a category
function toggleDropdown(category: string) {
	if (openDropdown === category) {
		openDropdown = null
	} else {
		openDropdown = category
	}
}

// Select a variant and close dropdown
function selectVariant(category: string, toolbarItem: ToolbarItem) {
	selectedCategoryItems = { ...selectedCategoryItems, [category]: toolbarItem }
	openDropdown = null
}

// Handle starting drag from toolbar
function handleToolbarDrag(category: string, event: MouseEvent) {
	const toolbarItem = selectedCategoryItems[category]
	const item = createDataItem(toolbarItem)
	const draggableItem: ExistingDraggableItem<ItemType> =
		itemDataToExistingDraggableItem(item)
	dragManager.startDraggingNewItem(draggableItem.itemData, event)
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
	const target = event.target as Element
	if (!target.closest('.plant-toolbar__item')) {
		openDropdown = null
	}
}

// Create a PlantPlacement for toolbar display
function createToolbarPlantPlacement(
	category: string,
	variant: ToolbarItem,
): PlantPlacement {
	const item = dataItems.find(
		(di) => getCategoryFromDataItem(di) === category && di.id === variant.itemData.id,
	)
	if (!item) {
		throw new Error(`Item not found: ${category} ${variant.itemData.id}`)
	}
	return {
		id: `toolbar-${category}-${variant.itemData.id}`,
		x: 0,
		y: 0,
		plantId: item.id,
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
		{#each itemCategories as family (family.displayName)}
			{@const selectedToolbarItem = selectedCategoryItems[family.displayName]}
			{@const toolbarPlacement = createToolbarPlantPlacement(
				family.displayName,
				selectedToolbarItem,
			)}
			{@const plant = createDataItem(selectedToolbarItem)}

			<div
				class="plant-toolbar__item flex flex-col items-center gap-1 relative overflow-visible"
			>
				<!-- Main tile (selected variant) -->
				<div
					class={`plant-toolbar__tile-container relative w-[60px] h-[60px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-grab transition-transform transition-shadow duration-100 overflow-visible
					${family.items[0].size === 2 ? 'plant-toolbar__tile-container--size-2' : ''}
					${family.items.length > 1 ? 'plant-toolbar__tile-container--clickable cursor-pointer' : ''}
					${openDropdown === family.displayName ? 'plant-toolbar__tile-container--open border-blue-500 shadow-lg' : ''}`}
					role="button"
					tabindex="0"
					use:clickOrHold={{
						onClick: () => {
							if (family.items.length > 1) {
								toggleDropdown(family.displayName)
							}
						},
						onHold: (e) => {
							handleToolbarDrag(family.displayName, e)
						},
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							if (family.items.length > 1) {
								toggleDropdown(family.displayName)
							} else {
								// Synthesize a mousedown event for drag initiation on keydown for single variant items
								const syntheticEvent = new MouseEvent('mousedown', {
									clientX: 0,
									clientY: 0,
									bubbles: true,
								})
								handleToolbarDrag(family.displayName, syntheticEvent)
							}
						}
					}}
				>
					<PlantPlacementTile
						placement={plantPlacementToExistingGardenItem(toolbarPlacement, plant)}
						sizePx={toolbarTileSize}
						showSizeBadge={true}
					/>

					<!-- Dropdown arrow for families with multiple variants -->
					{#if family.items.length > 1}
						<div
							class="plant-toolbar__dropdown-arrow absolute bottom-1 right-1 text-[8px] text-black/60 pointer-events-none"
						>
							{openDropdown === family.displayName ? '▲' : '▼'}
						</div>
					{/if}
				</div>

				<!-- Dropdown with variant options -->
				{#if openDropdown === family.displayName && family.items.length > 1}
					<div
						class="plant-toolbar__dropdown absolute top-full left-1/2 -translate-x-1/2 bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg z-[1000] flex flex-col items-center gap-1 min-w-[70px]"
					>
						{#each family.items as variant (variant.displayName)}
							{@const variantPlacement = createToolbarPlantPlacement(
								family.displayName,
								variant.displayName,
							)}
							{@const variantPlant = createPlant(family.displayName, variant.displayName)}
							<div
								class={`plant-toolbar__tile-container plant-toolbar__tile-container--variant relative w-[50px] h-[50px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-pointer transition-transform transition-shadow duration-100 overflow-visible
								${variant.size === 2 ? 'plant-toolbar__tile-container--size-2' : ''}`}
								role="button"
								tabindex="0"
								use:clickOrHold={{
									onClick: () => {
										selectVariant(family.displayName, variant.displayName)
									},
									onHold: (e) => {
										selectVariant(family.displayName, variant.displayName) // Select first, then drag
										handleToolbarDrag(family.displayName, e)
									},
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation() // Prevent main tile keydown
										selectVariant(family.displayName, variant.displayName)
									}
								}}
							>
								<PlantPlacementTile
									placement={plantPlacementToExistingGardenItem(
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
					{family.displayName}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Global click handler to close dropdowns -->
<svelte:window onclick={handleClickOutside} />
