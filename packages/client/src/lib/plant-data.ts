import { timeout } from '../utils/promise'
import type { PlantToolbarPlantFamily } from '../private-ui/components/PlantToolbar.svelte'

export async function fetchPlantFamilies(): Promise<PlantToolbarPlantFamily[]> {
	await timeout(300) // Fake delay to simulate network call
	return [
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
}
