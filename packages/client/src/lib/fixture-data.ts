import {
	convertDistanceToFeet,
	type Item,
	type SeedPacket,
	type Workspace,
} from '@peashoot/types'

interface BasicPlantData {
	id: string
	name: string
	family: string
	variant: string
	plantingDistance: { value: number; unit: 'feet' }
	accentColor: { red: number; green: number; blue: number }
	iconPath: string
}

export function createPlantItem(plantData: BasicPlantData): Item {
	const plantingDistanceInFeet = convertDistanceToFeet(plantData.plantingDistance).value
	const size = Math.max(1, Math.ceil(plantingDistanceInFeet))

	return {
		id: plantData.id,
		displayName: plantData.name,
		category: plantData.family,
		variant: plantData.name,
		size: size,
		presentation: {
			accentColor: plantData.accentColor,
			iconPath: plantData.iconPath,
		},
		metadata: {
			plantingDistanceInFeet,
		},
	}
}

export const seedPackets: SeedPacket[] = [
	{
		id: 'seedp_0',
		name: 'Celery Seeds',
		presentation: {
			iconPath: 'celery-celery.png',
			accentColor: { red: 144, green: 238, blue: 144 },
		},
		description: 'Celery seeds are a great way to add some green to your garden.',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
		category: 'celery',
		metadata: {
			quantity: 10,
			plantingInstructions: 'Sow seeds 1/2 inch deep in soil.',
			plantingDistance: {
				value: 1,
				unit: 'feet',
			},
			netWeightGrams: 10,
			originLocation: 'Colombia',
		},
	},
	{
		id: 'seedp_1',
		name: 'Big Boy Tomato',
		presentation: {
			iconPath: 'tomatoes-big-boy-tomato.png',
			accentColor: { red: 255, green: 99, blue: 71 },
		},
		description:
			'Classic indeterminate beefsteak tomato producing large, meaty fruits up to 1 pound. Excellent for slicing and sandwiches.',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
		category: 'tomatoes',

		metadata: {
			quantity: 30,
			plantingInstructions: 'Sow seeds 1/4 inch deep.',
			plantingDistance: {
				value: 2,
				unit: 'feet',
			},
			netWeightGrams: 1,
			originLocation: 'USA',
		},
	},
	{
		id: 'seedp_2',
		name: 'Basil',
		presentation: {
			iconPath: 'basil-basil.png',
			accentColor: { red: 133, green: 187, blue: 101 },
		},
		description:
			'Aromatic annual herb with excellent culinary uses. Natural pest deterrent and pollinator attractor.',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
		category: 'basil',

		metadata: {
			quantity: 100,
			plantingInstructions: 'Sow seeds 1/4 inch deep.',
			plantingDistance: {
				value: 1,
				unit: 'feet',
			},
			netWeightGrams: 0.5,
			originLocation: 'India',
		},
	},
]

// Convert legacy plant data to PlantItem format
export const plants: Item[] = (
	[
		// Tomatoes
		{
			id: 'plant_tomatoes-burpee-big-boy-tomato',
			name: 'Big Boy Tomato',
			family: 'tomatoes',
			variant: 'burpee-big-boy-tomato',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-big-boy-tomato.png',
		},
		{
			id: 'plant_tomatoes-rareseeds-cherokee-purple-tomato',
			name: 'Cherokee Purple Tomato',
			family: 'tomatoes',
			variant: 'rareseeds-cherokee-purple-tomato',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-cherokee-purple-tomato.png',
		},
		{
			id: 'plant_tomatoes-sweet-100-tomato',
			name: 'Sweet 100 Cherry Tomato',
			family: 'tomatoes',
			variant: 'sweet-100-tomato',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-sweet-100-cherry-tomato.png',
		},
		{
			id: 'plant_tomatoes-napa-chardonnay-tomato',
			name: 'Napa Chardonnay Tomato',
			family: 'tomatoes',
			variant: 'napa-chardonnay-tomato',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-tomatoes-yellow
			iconPath: 'tomatoes-napa-chardonnay-tomato.png',
		},
		{
			id: 'plant_tomatoes-black-from-tula-tomato',
			name: 'Black from Tula Tomato',
			family: 'tomatoes',
			variant: 'black-from-tula-tomato',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-black-from-tula-tomato.png',
		},

		// Lettuce & Greens
		{
			id: 'plant_lettuce-burpee-buttercrunch-lettuce',
			name: 'Buttercrunch Lettuce',
			family: 'lettuce',
			variant: 'burpee-buttercrunch-lettuce',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
			iconPath: 'lettuce-buttercrunch-lettuce.png',
		},
		{
			id: 'plant_arugula-arugula',
			name: 'Arugula',
			family: 'arugula',
			variant: 'arugula',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
			iconPath: 'arugula-arugula.png',
		},
		{
			id: 'plant_spinach-spinach',
			name: 'Spinach',
			family: 'spinach',
			variant: 'spinach',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 56, green: 142, blue: 60 }, // --color-spinach-green
			iconPath: 'spinach-spinach.png',
		},
		{
			id: 'plant_spinach-japanese-perpetual-spinach',
			name: 'Japanese Perpetual Spinach',
			family: 'spinach',
			variant: 'japanese-perpetual-spinach',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 56, green: 142, blue: 60 }, // --color-spinach-green
			iconPath: 'spinach-japanese-perpetual-spinach.png',
		},

		// Carrots
		{
			id: 'plant_carrots-burpee-chantenay-carrot',
			name: 'Chantenay Red Core Carrot',
			family: 'carrots',
			variant: 'burpee-chantenay-carrot',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 167, blue: 38 }, // --color-carrots-orange
			iconPath: 'carrots-chantenay-red-core-carrot.png',
		},
		{
			id: 'plant_carrots-parisienne-carrots',
			name: 'Parisienne Carrots',
			family: 'carrots',
			variant: 'parisienne-carrots',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 167, blue: 38 }, // --color-carrots-orange
			iconPath: 'carrots-parisienne-carrots.png',
		},
		{
			id: 'plant_carrots-lila-lu-sang-carrots',
			name: 'Lila Lu Sang Purple Carrots',
			family: 'carrots',
			variant: 'lila-lu-sang-carrots',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-carrots-purple
			iconPath: 'carrots-lila-lu-sang-purple-carrots.png',
		},

		// Peppers
		{
			id: 'plant_peppers-burpee-california-wonder-pepper',
			name: 'California Wonder Bell Pepper',
			family: 'peppers',
			variant: 'burpee-california-wonder-pepper',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 58, green: 145, blue: 63 }, // --color-peppers-green
			iconPath: 'peppers-california-wonder-bell-pepper.png',
		},
		{
			id: 'plant_peppers-jalapeno-hot-pepper',
			name: 'Jalapeño Hot Pepper',
			family: 'peppers',
			variant: 'jalapeno-hot-pepper',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 58, green: 145, blue: 63 }, // --color-peppers-green
			iconPath: 'peppers-jalapeno-hot-pepper.png',
		},
		{
			id: 'plant_peppers-habanero-hot-pepper',
			name: 'Habanero Hot Pepper',
			family: 'peppers',
			variant: 'habanero-hot-pepper',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 247, green: 92, blue: 3 }, // --color-peppers-orange
			iconPath: 'peppers-habanero-hot-pepper.png',
		},
		{
			id: 'plant_peppers-lemon-drop-hot-pepper',
			name: 'Lemon Drop Hot Pepper',
			family: 'peppers',
			variant: 'lemon-drop-hot-pepper',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-peppers-yellow
			iconPath: 'peppers-lemon-drop-hot-pepper.png',
		},
		{
			id: 'plant_peppers-buena-mulata-hot-pepper',
			name: 'Buena Mulata Hot Pepper',
			family: 'peppers',
			variant: 'buena-mulata-hot-pepper',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-peppers-purple
			iconPath: 'peppers-buena-mulata-hot-pepper.png',
		},

		// Beans
		{
			id: 'plant_beans-burpee-provider-bush-bean',
			name: 'Provider Bush Bean',
			family: 'beans',
			variant: 'burpee-provider-bush-bean',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-provider-bush-bean.png',
		},
		{
			id: 'plant_beans-fava-beans',
			name: 'Fava Beans',
			family: 'beans',
			variant: 'fava-beans',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-fava-beans.png',
		},
		{
			id: 'plant_beans-dragons-tongue-beans',
			name: "Dragon's Tongue Bush Bean",
			family: 'beans',
			variant: 'dragons-tongue-beans',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-beans-yellow
			iconPath: 'beans-dragons-tongue-bush-bean.png',
		},
		{
			id: 'plant_beans-cherokee-trail-of-tears-beans',
			name: 'Cherokee Trail of Tears Bean',
			family: 'beans',
			variant: 'cherokee-trail-of-tears-beans',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-beans-purple
			iconPath: 'beans-cherokee-trail-of-tears-beans.png',
		},
		{
			id: 'plant_beans-scarlet-runner-beans',
			name: 'Scarlet Runner Bean',
			family: 'beans',
			variant: 'scarlet-runner-beans',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-scarlet-runner-beans.png',
		},

		// Onions & Alliums
		{
			id: 'plant_onions-rareseeds-yellow-of-parma-onion',
			name: 'Yellow of Parma Onion',
			family: 'onions',
			variant: 'rareseeds-yellow-of-parma-onion',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-onions-yellow
			iconPath: 'onions-yellow-of-parma-onion.png',
		},
		{
			id: 'plant_onions-burpee-evergreen-hardy-white-scallions',
			name: 'Evergreen Hardy White Scallions',
			family: 'onions',
			variant: 'burpee-evergreen-hardy-white-scallions',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-evergreen-hardy-white-scallions.png',
		},
		{
			id: 'plant_onions-chives',
			name: 'Chives',
			family: 'onions',
			variant: 'chives',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-mint-green
			iconPath: 'onions-chives.png',
		},
		{
			id: 'plant_onions-garlic',
			name: 'Garlic',
			family: 'onions',
			variant: 'garlic',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-garlic.png',
		},
		{
			id: 'plant_onions-bunching-onion',
			name: 'Bunching Onion',
			family: 'onions',
			variant: 'bunching-onion',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-bunching-onion.png',
		},

		// Fruits
		{
			id: 'plant_cherries-rainier-cherry',
			name: 'Rainier Cherry',
			family: 'cherries',
			variant: 'rainier-cherry',
			plantingDistance: { value: 3, unit: 'feet' },
			accentColor: { red: 255, green: 192, blue: 203 }, // --color-cherries-pink
			iconPath: 'cherries-rainier-cherry.png',
		},
		{
			id: 'plant_strawberries-alexandria-strawberry',
			name: 'Alexandria Strawberry',
			family: 'strawberries',
			variant: 'alexandria-strawberry',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 220, green: 20, blue: 60 }, // --color-strawberries-red
			iconPath: 'strawberries-alexandria-alpine-strawberry.png',
		},

		// Flowers
		{
			id: 'plant_daisies-zinnia-2',
			name: 'Zinnia',
			family: 'daisies',
			variant: 'zinnia',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 105, blue: 180 },
			iconPath: 'daisies-zinnia.png',
		},
		// --- ADDED FROM seeds.yml ---
		{
			id: 'plant_basil',
			name: 'Basil',
			family: 'basil',
			variant: 'basil',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 85, green: 107, blue: 47 },
			iconPath: 'basil-basil.png',
		},
		{
			id: 'plant_foxglove',
			name: 'Foxglove',
			family: 'snapdragons',
			variant: 'foxglove',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 186, green: 85, blue: 211 },
			iconPath: 'snapdragons-foxglove.png',
		},
		{
			id: 'plant_zinnia',
			name: 'Zinnia',
			family: 'daisies',
			variant: 'zinnia',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 105, blue: 180 },
			iconPath: 'daisies-zinnia.png',
		},
		{
			id: 'plant_watermelon',
			name: 'Watermelon',
			family: 'watermelons',
			variant: 'watermelon',
			plantingDistance: { value: 4, unit: 'feet' },
			accentColor: { red: 50, green: 205, blue: 50 },
			iconPath: 'watermelons-watermelon.png',
		},
		{
			id: 'plant_wheat',
			name: 'Wheat',
			family: 'grains',
			variant: 'wheat',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 222, green: 184, blue: 135 },
			iconPath: 'grains-wheat.png',
		},
		{
			id: 'plant_broccoli',
			name: 'Broccoli',
			family: 'brassicas',
			variant: 'broccoli',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 85, green: 107, blue: 47 },
			iconPath: 'broccoli-broccoli.png',
		},
		{
			id: 'plant_sunflower',
			name: 'Sunflower',
			family: 'sunflowers',
			variant: 'sunflower',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 255, green: 215, blue: 0 },
			iconPath: 'sunflowers-sunflower.png',
		},
		{
			id: 'plant_lupine',
			name: 'Lupine',
			family: 'legumes',
			variant: 'lupine',
			plantingDistance: { value: 2, unit: 'feet' },
			accentColor: { red: 123, green: 104, blue: 238 },
			iconPath: 'legumes-lupine.png',
		},
		{
			id: 'plant_rutabaga',
			name: 'Rutabaga',
			family: 'turnips',
			variant: 'rutabaga',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 238, green: 232, blue: 170 },
			iconPath: 'rutabagas-rutabaga.png',
		},
		{
			id: 'plant_celery',
			name: 'Celery',
			family: 'celery',
			variant: 'celery',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 144, green: 238, blue: 144 },
			iconPath: 'celery-celery.png',
		},
		{
			id: 'plant_marigold',
			name: 'Marigold',
			family: 'marigolds',
			variant: 'marigold',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 140, blue: 0 },
			iconPath: 'marigolds-marigold.png',
		},
		{
			id: 'plant_cilantro',
			name: 'Cilantro',
			family: 'cilantro',
			variant: 'cilantro',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 34, green: 139, blue: 34 },
			iconPath: 'cilantro-cilantro.png',
		},
		{
			id: 'plant_brassicas-bok-choy',
			name: 'Bok Choy',
			family: 'brassicas',
			variant: 'bok-choy',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 152, green: 251, blue: 152 },
			iconPath: 'brassicas-bok-choy.png',
		},
		{
			id: 'plant_peas',
			name: 'Super Sugar Snap Pea',
			family: 'peas',
			variant: 'super-sugar-snap',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 123, green: 182, blue: 97 },
			iconPath: 'peas-sugar-snap-peas.png',
		},
		{
			id: 'plant_dahlia',
			name: 'Dahlia',
			family: 'dasies',
			variant: 'dahlia',
			plantingDistance: { value: 1, unit: 'feet' },
			accentColor: { red: 255, green: 87, blue: 34 },
			iconPath: 'daisies-dahlia.png',
		},
	] satisfies BasicPlantData[]
).map(createPlantItem)

function findPlantById(id: string): Item {
	const result = plants.find((plant) => plant.id === id)
	if (!result) {
		throw new Error(`Plant with id ${id} not found`)
	}
	return result
}

export const gardens: Workspace[] = [
	{
		id: 'grdn_0',
		indicators: [
			{
				id: 'indicator_0',
				effects: [
					{
						sourceItemTypeId: 'plant_lettuce-burpee-buttercrunch-lettuce',
						targetItemTypeId: 'plant_tomatoes-burpee-big-boy-tomato',
						nature: 'beneficial',
						description: 'Lettuce provides a living mulch, suppressing weeds.',
					},
					{
						sourceItemTypeId: 'plant_tomatoes-burpee-big-boy-tomato',
						targetItemTypeId: 'plant_lettuce-burpee-buttercrunch-lettuce',
						nature: 'beneficial',
						description: 'Tomatoes provide shade for lettuce.',
					},
				],
			},
			{
				id: 'indicator_1',
				effects: [
					{
						sourceItemTypeId: 'plant_arugula-arugula',
						targetItemTypeId: 'plant_spinach-japanese-perpetual-spinach',
						nature: 'neutral',
						description: 'Arugula and Spinach have similar needs and do not interfere.',
					},
					{
						sourceItemTypeId: 'plant_spinach-japanese-perpetual-spinach',
						targetItemTypeId: 'plant_arugula-arugula',
						nature: 'neutral',
						description: 'Arugula and Spinach have similar needs and do not interfere.',
					},
				],
			},
			{
				id: 'indicator_2',
				effects: [
					{
						sourceItemTypeId: 'plant_dahlia',
						targetItemTypeId: 'plant_broccoli',
						nature: 'beneficial',
						description: 'Dahlia deters pests that affect Broccoli.',
					},
					{
						sourceItemTypeId: 'plant_onions-garlic',
						targetItemTypeId: 'plant_peas',
						nature: 'harmful',
						description:
							'Garlic releases chemicals that can kill needed soil bacteria for peas.',
					},
					{
						sourceItemTypeId: 'plant_onions-garlic',
						targetItemTypeId: 'plant_broccoli',
						nature: 'beneficial',
						description: 'Garlic deters pests that affect Broccoli.',
					},
				],
			},
		],
		zones: [
			{
				id: 'bed_962af647-bce5-4cff-9d47-e22ef97a20e0',
				width: 12,
				height: 2,
				placements: [],
				description: 'A bed of lettuce',
				name: 'Bed #1',
			},
			{
				id: 'bed_ee059cdd-d907-4c1a-99c5-5cfb34c47b2d',
				width: 1,
				height: 1,
				description: 'A bed of tomatoes',
				name: 'Bed #2',
				placements: [
					{
						id: 'plant_placement_c806fc0b-b50d-489c-9aa4-30e9448769ae',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_tomatoes-burpee-big-boy-tomato'),
						sourceZoneId: 'bed_ee059cdd-d907-4c1a-99c5-5cfb34c47b2d',
					},
				],
			},
			{
				id: 'bed_642de3aa-1d4e-44bc-b40a-db89c23c8aa4',
				width: 1,
				height: 1,
				description: 'A bed of lettuce',
				name: 'A raised bed',
				placements: [
					{
						id: 'plant_placement_16cee04a-c890-478e-9ac6-3ee02b3e0db6',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_lettuce-burpee-buttercrunch-lettuce'),
						sourceZoneId: 'bed_642de3aa-1d4e-44bc-b40a-db89c23c8aa4',
					},
				],
			},
			{
				id: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
				width: 6,
				height: 2,
				name: 'Bed #6',
				description: 'A bed of tomatoes and lettuce',
				placements: [
					{
						id: 'plant_placement_c7bc1a01-38e3-47bb-93cd-992334b4babb',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_tomatoes-burpee-big-boy-tomato'),
						sourceZoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
					},
					{
						id: 'plant_placement_1aac58bc-ad63-4fa9-8927-793d19cc841b',
						position: { x: 2, y: 0 },
						item: findPlantById('plant_lettuce-burpee-buttercrunch-lettuce'),
						sourceZoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
					},
					{
						id: 'plant_placement_1aac58bc-ad63-4fa9-8927-7939cc841b',
						position: { x: 2, y: 1 },
						item: findPlantById('plant_lettuce-burpee-buttercrunch-lettuce'),
						sourceZoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
					},
				],
			},
			{
				id: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
				width: 6,
				height: 2,
				name: 'Bed #5',
				description: 'A bed of arugula and spinach',
				placements: [
					{
						id: 'plant_placement_f41c815b-6774-4017-bf19-067ac3f81099',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_arugula-arugula'),
						sourceZoneId: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
					},
					{
						id: 'plant_placement_4c957f8b-1b4f-4a8a-aa92-70eefcb052b7',
						position: { x: 2, y: 0 },
						item: findPlantById('plant_spinach-japanese-perpetual-spinach'),
						sourceZoneId: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
					},
				],
			},
			{
				id: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
				width: 12,
				height: 4,
				name: 'Bed #4',
				description: 'A bed of cherries',
				placements: [
					{
						id: 'plant_placement_f2321084-5ff0-4328-b90a-776de35d8f81',
						position: { x: 2, y: 1 },
						item: findPlantById('plant_cherries-rainier-cherry'),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
					{
						id: 'plant_placement_86b880d5-77c0-487d-8fdd-34260c9c0bc6',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_tomatoes-burpee-big-boy-tomato'),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
					{
						id: 'plant_placement_e2ab8f6e-513d-4dff-9a76-d78f741eee13',
						position: { x: 2, y: 0 },
						item: findPlantById('plant_lettuce-burpee-buttercrunch-lettuce'),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},

					{
						id: 'plant_placement_3ca27ca0-6438-47d8-8b90-7af77b24f430',
						position: { x: 6, y: 0 },
						item: findPlantById('plant_strawberries-alexandria-strawberry'),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},

					{
						id: 'plant_placement_224254bb-e30b-44ab-8b6c-f9988bb49f2a',
						position: { x: 6, y: 3 },
						item: findPlantById('plant_daisies-zinnia-2'),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
				],
			},
			{
				id: 'bed_complex_interaction',
				width: 2,
				height: 2,
				name: 'Bed #3',
				description: 'A bed of complex interaction',
				placements: [
					{
						id: 'plant_placement_garlic',
						position: { x: 0, y: 1 },
						item: findPlantById('plant_onions-garlic'),
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_dahlia',
						position: { x: 1, y: 1 },
						item: findPlantById('plant_dahlia'),
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_broccoli',
						position: { x: 0, y: 0 },
						item: findPlantById('plant_broccoli'),
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_peas',
						position: { x: 1, y: 0 },
						item: findPlantById('plant_peas'),
						sourceZoneId: 'bed_complex_interaction',
					},
				],
			},
		],
	},
]
