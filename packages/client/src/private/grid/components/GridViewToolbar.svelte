<script lang="ts" generics="TItem extends Item">
import type { GridItemPresentation, GridPlaceable } from '../grid-placement'
import { dragManager } from '../../dnd/drag-manager'
import { dragState } from '../../dnd/state'
import GridPlacementTile from '../ui/GridPlacementTile.svelte'
import type { GridPlacement } from '../grid-placement'
import { DEFAULT_LAYOUT_PARAMS } from '../grid-layout-constants'
import { clickOrHold } from '../actions/clickOrHold'
import type { WithVisualPresentation } from '../grid-placement'
import type { Item } from '../../../lib/entities/item'

export interface GridToolbarProps<TItem extends WithVisualPresentation> {
	items: TItem[]
	[k: string]: unknown
}

interface ToolbarGridItemCategory extends GridPlaceable {
	displayName: string
	presentation: GridItemPresentation
	items: GridPlaceable[]
}

const { items = [], ...rest }: GridToolbarProps<TItem> = $props()

const itemListToToolbarCategories = (itemList: TItem[]): ToolbarGridItemCategory[] => {
	const categories = new Map<string, ToolbarGridItemCategory>()
	for (const item of itemList) {
		const itemCategory = item.category
		const category = categories.get(itemCategory)
		if (!category) {
			// Create a new family and add the current plant as the first variant
			categories.set(itemCategory, {
				id: item.id,
				size: item.size,
				displayName: itemCategory,
				presentation: { ...item.presentation },
				items: [
					{
						id: item.id,
						size: item.size,
						displayName: item.displayName,
						presentation: { ...item.presentation },
					},
				],
			})
		} else {
			category.items.push({
				id: item.id,
				size: item.size,
				displayName: item.displayName,
				presentation: { ...item.presentation },
			})
		}
	}
	return Array.from(categories.values())
}

const categories = itemListToToolbarCategories(items)

// Track selected variants for each plant family
let categorySelectedItems: Record<string, string> = $state(
	categories.reduce<Record<string, string>>((acc, category) => {
		acc[category.displayName] = category.items[0].displayName
		return acc
	}, {}),
)

// Track which dropdown is currently open
let openDropdown: string | null = $state(null)

// Toggle dropdown for a plant family
function toggleDropdown(categoryName: string) {
	if (openDropdown === categoryName) {
		openDropdown = null
	} else {
		openDropdown = categoryName
	}
}

// Select a variant and close dropdown
function selectCategoryItem(categoryName: string, itemName: string) {
	categorySelectedItems = { ...categorySelectedItems, [categoryName]: itemName }
	openDropdown = null
}

// Handle starting drag from toolbar
function handleToolbarDrag(categoryName: string, event: MouseEvent | TouchEvent) {
	const categoryItem = categorySelectedItems[categoryName]
	const plant = createItem(categoryName, categoryItem)
	dragManager.startDraggingNewItem(plant, event)
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
	const target = event.target as Element
	if (!target.closest('.plant-toolbar__item')) {
		openDropdown = null
	}
}

// Create a plant object from family and variant
function createItem(categoryName: string, categoryItemName: string): TItem {
	const item = items.find(
		(itm) => itm.category === categoryName && itm.displayName === categoryItemName,
	)
	if (!item) {
		throw new Error(`Item not found: ${categoryName} ${categoryItemName}`)
	}
	return item
}

// Create a GridPlacement for toolbar display
function createToolbarGridPlacement(
	categoryName: string,
	categoryItemName: string,
): GridPlacement<TItem> {
	const item = items.find(
		(itm) => itm.category === categoryName && itm.displayName === categoryItemName,
	)
	if (!item) {
		throw new Error(`Item not found: ${categoryName} ${categoryItemName}`)
	}
	return {
		id: `gridplacement_${categoryName}_${categoryItemName}`,
		x: 0,
		y: 0,
		size: item.size,
		item: item,
		sourceZoneId: 'toolbar', // Required by ExistingDraggableItem
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
.plant-toolbar-item {
	transition: all 0.2s;
}
</style>

<div
	{...rest}
	class={`plant-toolbar overflow-visible mb-6 ${typeof rest.class === 'string' ? rest.class : ''} ${$dragState.draggedNewItem !== null ? 'dragging' : ''}`}
>
	<div
		class="plant-toolbar__grid grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-1"
	>
		{#each categories as category (category.displayName)}
			{@const selectedItem = categorySelectedItems[category.displayName]}
			{@const toolbarPlacement = createToolbarGridPlacement(
				category.displayName,
				selectedItem,
			)}

			<div
				class="plant-toolbar__item flex flex-col items-center gap-1 relative overflow-visible"
			>
				<!-- Main tile (selected variant) -->
				<div
					class={`plant-toolbar__tile-container relative w-[60px] h-[60px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-grab transition-transform transition-shadow duration-100 overflow-visible
					${category.items[0].size === 2 ? 'plant-toolbar__tile-container--size-2' : ''}
					${category.items.length > 1 ? 'plant-toolbar__tile-container--clickable cursor-pointer' : ''}
					${openDropdown === category.displayName ? 'plant-toolbar__tile-container--open border-blue-500 shadow-lg' : ''}`}
					role="button"
					tabindex="0"
					use:clickOrHold={{
						onClick: () => {
							if (category.items.length > 1) {
								toggleDropdown(category.displayName)
							}
						},
						onHold: (e) => {
							handleToolbarDrag(category.displayName, e)
						},
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							if (category.items.length > 1) {
								toggleDropdown(category.displayName)
							} else {
								// Synthesize a mousedown event for drag initiation on keydown for single variant items
								const syntheticEvent = new MouseEvent('mousedown', {
									clientX: 0,
									clientY: 0,
									bubbles: true,
								})
								handleToolbarDrag(category.displayName, syntheticEvent)
							}
						}
					}}
				>
					<GridPlacementTile
						placement={toolbarPlacement}
						sizePx={toolbarTileSize}
						showSizeBadge={true}
					/>

					<!-- Dropdown arrow for families with multiple variants -->
					{#if category.items.length > 1}
						<div
							class="plant-toolbar__dropdown-arrow absolute bottom-1 right-1 text-[8px] text-black/60 pointer-events-none"
						>
							{openDropdown === category.displayName ? '▲' : '▼'}
						</div>
					{/if}
				</div>

				<!-- Dropdown with variant options -->
				{#if openDropdown === category.displayName && category.items.length > 1}
					<div
						class="plant-toolbar__dropdown absolute top-full left-1/2 -translate-x-1/2 bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg z-[9999] flex flex-col items-center gap-1 min-w-[70px]"
					>
						{#each category.items as item (item.displayName)}
							{@const gridPlacement = createToolbarGridPlacement(
								category.displayName,
								item.displayName,
							)}
							<div
								class={`plant-toolbar__tile-container plant-toolbar__tile-container--variant relative w-[50px] h-[50px] flex items-center justify-center rounded-md border-2 border-black/40 box-border shadow-md user-select-none cursor-pointer transition-transform transition-shadow duration-100 overflow-visible
								${item.size === 2 ? 'plant-toolbar__tile-container--size-2' : ''}`}
								role="button"
								tabindex="0"
								use:clickOrHold={{
									onClick: () => {
										selectCategoryItem(category.displayName, item.displayName)
									},
									onHold: (e) => {
										selectCategoryItem(category.displayName, item.displayName) // Select first, then drag
										handleToolbarDrag(category.displayName, e)
									},
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation() // Prevent main tile keydown
										selectCategoryItem(category.displayName, item.displayName)
									}
								}}
							>
								<GridPlacementTile
									placement={gridPlacement}
									sizePx={46}
									showSizeBadge={true}
								/>
							</div>
						{/each}
					</div>
				{/if}

				<div class="plant-toolbar__label text-xs font-medium text-gray-500 text-center">
					{category.displayName}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Global click handler to close dropdowns -->
<svelte:window onclick={handleClickOutside} />
