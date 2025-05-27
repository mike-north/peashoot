<script lang="ts">
import type { Plant } from '../../lib/plant'
import { dragManager } from '../../lib/drag-manager'
import { dragState } from '../state/dragState'

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
let selectedVariants: Record<string, string> = {}

// Initialize with first variant of each family
plantFamilies.forEach((family) => {
	selectedVariants[family.name] = family.variants[0].name
})

// Generate a unique ID for new plants
function generatePlantId(familyName: string, variant: string): string {
	return `new-${familyName}-${variant}-${Date.now()}`
}

// Create a plant object from family and variant
function createPlant(familyName: string, variant: string): Plant {
	const family = plantFamilies.find((f) => f.name === familyName)
	if (!family) {
		throw new Error(`Plant family not found: ${familyName}`)
	}
	return {
		id: generatePlantId(familyName, variant),
		name: family.displayName,
		icon: family.icon,
		size: family.size,
		plantFamily: {
			name: familyName,
			colorVariant: variant,
		},
	}
}

// Handle starting drag from toolbar
function handleToolbarDrag(familyName: string, event: MouseEvent) {
	const variant = selectedVariants[familyName]
	const plant = createPlant(familyName, variant)
	dragManager.startDraggingNewPlant(plant, event)
}

// Get CSS variable for plant color
function getPlantColorVariable(familyName: string, colorVariant: string): string {
	return `--color-${familyName}-${colorVariant}`
}

// Check if we should use white text for dark backgrounds
function isDarkBackground(colorVariant: string): boolean {
	return ['dark', 'red', 'purple', 'brown'].includes(colorVariant)
}
</script>

<style lang="scss">
.plant-toolbar {
	background: #f8f9fa;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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
		gap: 12px;
	}

	&__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	&__tile {
		width: 60px;
		height: 60px;
		border-radius: 8px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		transition:
			transform 0.1s,
			box-shadow 0.1s;
		user-select: none;
		position: relative;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		}

		&:active {
			cursor: grabbing;
			transform: translateY(0);
		}

		&--size-2 {
			position: relative;
			&::after {
				content: '2×2';
				position: absolute;
				top: 2px;
				right: 2px;
				font-size: 8px;
				background: rgba(0, 0, 0, 0.7);
				color: white;
				padding: 1px 3px;
				border-radius: 2px;
			}
		}
	}

	&__label {
		font-size: 0.8rem;
		font-weight: 500;
		color: #6c757d;
		text-align: center;
	}

	&__variant-select {
		padding: 4px 8px;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 0.75rem;
		background: white;
		color: #495057;
		cursor: pointer;

		&:focus {
			outline: none;
			border-color: #80bdff;
			box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
		}
	}
}

.dragging {
	.plant-toolbar__tile {
		pointer-events: none;
		opacity: 0.5;
	}
}
</style>

<div class="plant-toolbar" class:dragging={$dragState.draggedNewPlant !== null}>
	<div class="plant-toolbar__title">Plant Toolbar</div>
	<div class="plant-toolbar__grid">
		{#each plantFamilies as family (family.name)}
			{@const selectedVariant = selectedVariants[family.name]}
			{@const colorVar = getPlantColorVariable(family.name, selectedVariant)}
			{@const textColor = isDarkBackground(selectedVariant) ? 'white' : '#4b4e6d'}

			<div class="plant-toolbar__item">
				<div
					class="plant-toolbar__tile"
					class:plant-toolbar__tile--size-2={family.size === 2}
					style="background-color: var({colorVar}); color: {textColor};"
					role="button"
					tabindex="0"
					onmousedown={(e) => {
						handleToolbarDrag(family.name, e)
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							// Create a synthetic mouse event for keyboard activation
							const syntheticEvent = new MouseEvent('mousedown', {
								clientX: 0,
								clientY: 0,
								bubbles: true,
							})
							handleToolbarDrag(family.name, syntheticEvent)
						}
					}}
				>
					{family.icon}
				</div>

				<div class="plant-toolbar__label">{family.displayName}</div>

				<select
					class="plant-toolbar__variant-select"
					bind:value={selectedVariants[family.name]}
				>
					{#each family.variants as variant (variant.name)}
						<option value={variant.name}>{variant.displayName}</option>
					{/each}
				</select>
			</div>
		{/each}
	</div>
</div>
