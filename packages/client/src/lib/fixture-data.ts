import type { Garden } from '../private-lib/garden'
import type { Plant } from '../private-lib/plant'

export const gardens: Garden[] = [
	{
		id: 'garden_0',
		edgeIndicators: [
			{
				id: 'edge_indicator_0',
				plantAId: 'lettuce_1',
				plantBId: 'tomato_1',
				color: 'red',
			},
			{
				id: 'edge_indicator_1',
				plantAId: 'cherry_tomato_1',
				plantBId: 'tomato_2',
				color: 'red',
			},
		],
		beds: [
			{
				id: 'bed_962af647-bce5-4cff-9d47-e22ef97a20e0',
				width: 12,
				height: 2,
				waterLevel: 0,
				sunLevel: 2,
				plantPlacements: [],
			},
			{
				id: 'bed_ee059cdd-d907-4c1a-99c5-5cfb34c47b2d',
				width: 1,
				height: 1,
				waterLevel: 0,
				sunLevel: 0,
				plantPlacements: [
					{
						id: 'plant_placement_c806fc0b-b50d-489c-9aa4-30e9448769ae',
						x: 0,
						y: 0,
						plantId: 'tomatoes-burpee-big-boy-tomato',
					},
				],
			},
			{
				id: 'bed_642de3aa-1d4e-44bc-b40a-db89c23c8aa4',
				width: 1,
				height: 1,
				waterLevel: 0,
				sunLevel: 0,
				plantPlacements: [
					{
						id: 'plant_placement_16cee04a-c890-478e-9ac6-3ee02b3e0db6',
						x: 0,
						y: 0,
						plantId: 'lettuce-burpee-buttercrunch-lettuce',
					},
				],
			},
			{
				id: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
				width: 6,
				height: 2,
				waterLevel: 2,
				sunLevel: 4,
				plantPlacements: [
					{
						id: 'plant_placement_c7bc1a01-38e3-47bb-93cd-992334b4babb',
						x: 0,
						y: 0,
						plantId: 'tomatoes-burpee-big-boy-tomato',
					},
					{
						id: 'plant_placement_1aac58bc-ad63-4fa9-8927-793d19cc841b',
						x: 2,
						y: 0,
						plantId: 'lettuce-burpee-buttercrunch-lettuce',
					},
				],
			},
			{
				id: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
				width: 6,
				height: 2,
				waterLevel: 2,
				sunLevel: 4,
				plantPlacements: [
					{
						id: 'plant_placement_f41c815b-6774-4017-bf19-067ac3f81099',
						x: 0,
						y: 0,
						plantId: 'arugula-arugula',
					},
					{
						id: 'plant_placement_4c957f8b-1b4f-4a8a-aa92-70eefcb052b7',
						x: 2,
						y: 0,
						plantId: 'spinach-japanese-perpetual-spinach',
					},
				],
			},
			{
				id: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
				width: 12,
				height: 4,
				waterLevel: 3,
				sunLevel: 3,
				plantPlacements: [
					{
						id: 'plant_placement_f2321084-5ff0-4328-b90a-776de35d8f81',
						x: 2,
						y: 1,
						plantId: 'cherries-rainier-cherry',
					},
					{
						id: 'plant_placement_86b880d5-77c0-487d-8fdd-34260c9c0bc6',
						x: 0,
						y: 0,
						plantId: 'tomatoes-burpee-big-boy-tomato',
					},
					{
						id: 'plant_placement_e2ab8f6e-513d-4dff-9a76-d78f741eee13',
						x: 2,
						y: 0,
						plantId: 'lettuce-burpee-buttercrunch-lettuce',
					},

					{
						id: 'plant_placement_3ca27ca0-6438-47d8-8b90-7af77b24f430',
						x: 6,
						y: 0,
						plantId: 'strawberries-alexandria-strawberry',
					},

					{
						id: 'plant_placement_224254bb-e30b-44ab-8b6c-f9988bb49f2a',
						x: 6,
						y: 3,
						plantId: 'daisies-zinnia',
					},
				],
			},
		],
	},
]

export const plants: Plant[] = [
	// Tomatoes
	{
		id: 'tomatoes-burpee-big-boy-tomato',
		displayName: 'Big Boy Tomato',
		family: 'tomatoes',
		variant: 'burpee-big-boy-tomato',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 214, g: 40, b: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-burpee-big-boy-tomato.png',
		},
	},
	{
		id: 'tomatoes-rareseeds-cherokee-purple-tomato',
		displayName: 'Cherokee Purple Tomato',
		family: 'tomatoes',
		variant: 'rareseeds-cherokee-purple-tomato',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 128, g: 0, b: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-rareseeds-cherokee-purple-tomato.png',
		},
	},
	{
		id: 'tomatoes-sweet-100-tomato',
		displayName: 'Sweet 100 Cherry Tomato',
		family: 'tomatoes',
		variant: 'sweet-100-tomato',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 214, g: 40, b: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-sweet-100-tomato.png',
		},
	},
	{
		id: 'tomatoes-napa-chardonnay-tomato',
		displayName: 'Napa Chardonnay Tomato',
		family: 'tomatoes',
		variant: 'napa-chardonnay-tomato',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 255, g: 212, b: 0 }, // --color-tomatoes-yellow
			iconPath: 'tomatoes-napa-chardonnay-tomato.png',
		},
	},
	{
		id: 'tomatoes-black-from-tula-tomato',
		displayName: 'Black from Tula Tomato',
		family: 'tomatoes',
		variant: 'black-from-tula-tomato',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 128, g: 0, b: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-black-from-tula-tomato.png',
		},
	},

	// Lettuce & Greens
	{
		id: 'lettuce-burpee-buttercrunch-lettuce',
		displayName: 'Buttercrunch Lettuce',
		family: 'lettuce',
		variant: 'burpee-buttercrunch-lettuce',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 123, g: 182, b: 97 }, // --color-lettuce-green
			iconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
		},
	},
	{
		id: 'arugula-arugula',
		displayName: 'Arugula',
		family: 'arugula',
		variant: 'arugula',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 123, g: 182, b: 97 }, // --color-lettuce-green
			iconPath: 'arugula-arugula.png',
		},
	},
	{
		id: 'spinach-spinach',
		displayName: 'Spinach',
		family: 'spinach',
		variant: 'spinach',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 56, g: 142, b: 60 }, // --color-spinach-green
			iconPath: 'spinach-spinach.png',
		},
	},
	{
		id: 'spinach-japanese-perpetual-spinach',
		displayName: 'Japanese Perpetual Spinach',
		family: 'spinach',
		variant: 'japanese-perpetual-spinach',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 56, g: 142, b: 60 }, // --color-spinach-green
			iconPath: 'spinach-japanese-perpetual-spinach.png',
		},
	},

	// Carrots
	{
		id: 'carrots-burpee-chantenay-carrot',
		displayName: 'Chantenay Red Core Carrot',
		family: 'carrots',
		variant: 'burpee-chantenay-carrot',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 167, b: 38 }, // --color-carrots-orange
			iconPath: 'carrots-burpee-chantenay-carrot.png',
		},
	},
	{
		id: 'carrots-parisienne-carrots',
		displayName: 'Parisienne Carrots',
		family: 'carrots',
		variant: 'parisienne-carrots',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 167, b: 38 }, // --color-carrots-orange
			iconPath: 'carrots-parisienne-carrots.png',
		},
	},
	{
		id: 'carrots-lila-lu-sang-carrots',
		displayName: 'Lila Lu Sang Purple Carrots',
		family: 'carrots',
		variant: 'lila-lu-sang-carrots',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 128, g: 0, b: 128 }, // --color-carrots-purple
			iconPath: 'carrots-lila-lu-sang-carrots.png',
		},
	},

	// Peppers
	{
		id: 'peppers-burpee-california-wonder-pepper',
		displayName: 'California Wonder Bell Pepper',
		family: 'peppers',
		variant: 'burpee-california-wonder-pepper',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 58, g: 145, b: 63 }, // --color-peppers-green
			iconPath: 'peppers-burpee-california-wonder-pepper.png',
		},
	},
	{
		id: 'peppers-jalapeno-hot-pepper',
		displayName: 'Jalapeño Hot Pepper',
		family: 'peppers',
		variant: 'jalapeno-hot-pepper',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 58, g: 145, b: 63 }, // --color-peppers-green
			iconPath: 'peppers-jalapeno-hot-pepper.png',
		},
	},
	{
		id: 'peppers-habanero-hot-pepper',
		displayName: 'Habanero Hot Pepper',
		family: 'peppers',
		variant: 'habanero-hot-pepper',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 247, g: 92, b: 3 }, // --color-peppers-orange
			iconPath: 'peppers-habanero-hot-pepper.png',
		},
	},
	{
		id: 'peppers-lemon-drop-hot-pepper',
		displayName: 'Lemon Drop Hot Pepper',
		family: 'peppers',
		variant: 'lemon-drop-hot-pepper',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 212, b: 0 }, // --color-peppers-yellow
			iconPath: 'peppers-lemon-drop-hot-pepper.png',
		},
	},
	{
		id: 'peppers-buena-mulata-hot-pepper',
		displayName: 'Buena Mulata Hot Pepper',
		family: 'peppers',
		variant: 'buena-mulata-hot-pepper',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 128, g: 0, b: 128 }, // --color-peppers-purple
			iconPath: 'peppers-buena-mulata-hot-pepper.png',
		},
	},

	// Beans
	{
		id: 'beans-burpee-provider-bush-bean',
		displayName: 'Provider Bush Bean',
		family: 'beans',
		variant: 'burpee-provider-bush-bean',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 86, g: 130, b: 3 }, // --color-beans-green
			iconPath: 'beans-burpee-provider-bush-bean.png',
		},
	},
	{
		id: 'beans-fava-beans',
		displayName: 'Fava Beans',
		family: 'beans',
		variant: 'fava-beans',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 86, g: 130, b: 3 }, // --color-beans-green
			iconPath: 'beans-fava-beans.png',
		},
	},
	{
		id: 'beans-dragons-tongue-beans',
		displayName: "Dragon's Tongue Bush Bean",
		family: 'beans',
		variant: 'dragons-tongue-beans',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 212, b: 0 }, // --color-beans-yellow
			iconPath: 'beans-dragons-tongue-beans.png',
		},
	},
	{
		id: 'beans-cherokee-trail-of-tears-beans',
		displayName: 'Cherokee Trail of Tears Bean',
		family: 'beans',
		variant: 'cherokee-trail-of-tears-beans',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 128, g: 0, b: 128 }, // --color-beans-purple
			iconPath: 'beans-cherokee-trail-of-tears-beans.png',
		},
	},
	{
		id: 'beans-scarlet-runner-beans',
		displayName: 'Scarlet Runner Bean',
		family: 'beans',
		variant: 'scarlet-runner-beans',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 86, g: 130, b: 3 }, // --color-beans-green
			iconPath: 'beans-scarlet-runner-beans.png',
		},
	},

	// Onions & Alliums
	{
		id: 'onions-rareseeds-yellow-of-parma-onion',
		displayName: 'Yellow of Parma Onion',
		family: 'onions',
		variant: 'rareseeds-yellow-of-parma-onion',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 212, b: 0 }, // --color-onions-yellow
			iconPath: 'onions-rareseeds-yellow-of-parma-onion.png',
		},
	},
	{
		id: 'onions-burpee-evergreen-hardy-white-scallions',
		displayName: 'Evergreen Hardy White Scallions',
		family: 'onions',
		variant: 'burpee-evergreen-hardy-white-scallions',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 245, g: 245, b: 245 }, // --color-onions-white
			iconPath: 'onions-burpee-evergreen-hardy-white-scallions.png',
		},
	},
	{
		id: 'onions-chives',
		displayName: 'Chives',
		family: 'onions',
		variant: 'chives',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 86, g: 130, b: 3 }, // --color-mint-green
			iconPath: 'onions-chives.png',
		},
	},
	{
		id: 'onions-garlic',
		displayName: 'Garlic',
		family: 'onions',
		variant: 'garlic',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 245, g: 245, b: 245 }, // --color-onions-white
			iconPath: 'onions-garlic.png',
		},
	},
	{
		id: 'onions-bunching-onion',
		displayName: 'Bunching Onion',
		family: 'onions',
		variant: 'bunching-onion',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: {
				r: 245,
				g: 245,
				b: 245,
			},
			iconPath: 'onions-bunching-onion.png',
		},
	},

	// Fruits
	{
		id: 'cherries-rainier-cherry',
		displayName: 'Rainier Cherry',
		family: 'cherries',
		variant: 'rainier-cherry',
		plantingDistanceInFeet: 3,
		presentation: {
			accentColor: { r: 255, g: 192, b: 203 }, // --color-cherries-pink
			iconPath: 'cherries-rainier-cherry.png',
		},
	},
	{
		id: 'strawberries-alexandria-strawberry',
		displayName: 'Alexandria Strawberry',
		family: 'strawberries',
		variant: 'alexandria-strawberry',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 220, g: 20, b: 60 }, // --color-strawberries-red
			iconPath: 'strawberries-alexandria-strawberry.png',
		},
	},

	// Flowers
	{
		id: 'daisies-zinnia',
		displayName: 'Zinnia',
		family: 'daisies',
		variant: 'zinnia',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 105, b: 180 },
			iconPath: 'daisies-zinnia.png',
		},
	},
	// --- ADDED FROM seeds.yml ---
	{
		id: 'basil',
		displayName: 'Basil',
		family: 'basil',
		variant: 'basil',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 85, g: 107, b: 47 },
			iconPath: 'basil-basil.png',
		},
	},
	{
		id: 'foxglove',
		displayName: 'Foxglove',
		family: 'snapdragons',
		variant: 'foxglove',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 186, g: 85, b: 211 },
			iconPath: 'snapdragons-foxglove.png',
		},
	},
	{
		id: 'zinnia',
		displayName: 'Zinnia',
		family: 'daisies',
		variant: 'zinnia',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 105, b: 180 },
			iconPath: 'daisies-zinnia.png',
		},
	},
	{
		id: 'watermelon',
		displayName: 'Watermelon',
		family: 'watermelons',
		variant: 'watermelon',
		plantingDistanceInFeet: 4,
		presentation: {
			accentColor: { r: 50, g: 205, b: 50 },
			iconPath: 'watermelons-watermelon.png',
		},
	},
	{
		id: 'wheat',
		displayName: 'Wheat',
		family: 'grains',
		variant: 'wheat',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 222, g: 184, b: 135 },
			iconPath: 'grains-wheat.png',
		},
	},
	{
		id: 'broccoli',
		displayName: 'Broccoli',
		family: 'brassicas',
		variant: 'broccoli',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 85, g: 107, b: 47 },
			iconPath: 'broccoli-broccoli.png',
		},
	},
	{
		id: 'sunflower',
		displayName: 'Sunflower',
		family: 'sunflowers',
		variant: 'sunflower',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 255, g: 215, b: 0 },
			iconPath: 'sunflowers-sunflower.png',
		},
	},
	{
		id: 'lupine',
		displayName: 'Lupine',
		family: 'legumes',
		variant: 'lupine',
		plantingDistanceInFeet: 2,
		presentation: {
			accentColor: { r: 123, g: 104, b: 238 },
			iconPath: 'legumes-lupine.png',
		},
	},
	{
		id: 'rutabaga',
		displayName: 'Rutabaga',
		family: 'turnips',
		variant: 'rutabaga',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 238, g: 232, b: 170 },
			iconPath: 'rutabagas-rutabaga.png',
		},
	},
	{
		id: 'celery',
		displayName: 'Celery',
		family: 'celery',
		variant: 'celery',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 144, g: 238, b: 144 },
			iconPath: 'celery-celery.png',
		},
	},
	{
		id: 'marigold',
		displayName: 'Marigold',
		family: 'marigolds',
		variant: 'marigold',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 255, g: 140, b: 0 },
			iconPath: 'marigolds-marigold.png',
		},
	},
	{
		id: 'cilantro',
		displayName: 'Cilantro',
		family: 'cilantro',
		variant: 'cilantro',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 34, g: 139, b: 34 },
			iconPath: 'cilantro-cilantro.png',
		},
	},
	{
		id: 'bok-choy',
		displayName: 'Bok Choy',
		family: 'brassicas',
		variant: 'bok-choy',
		plantingDistanceInFeet: 1,
		presentation: {
			accentColor: { r: 152, g: 251, b: 152 },
			iconPath: 'brassicas-bok-choy.png',
		},
	},
]
