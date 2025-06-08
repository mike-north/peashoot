import { createPlantItem } from './item-types/plant-item'
import type { SeedPacket } from './entities/seed-packet'
import type { Workspace } from './entities/workspace'
import type { Item } from './entities/item'

// Convert legacy plant data to PlantItem format
export const plants: Item[] = [
	// Tomatoes
	{
		id: 'plant_tomatoes-burpee-big-boy-tomato',
		displayName: 'Big Boy Tomato',
		category: 'tomatoes',
		variant: 'burpee-big-boy-tomato',
		size: 2,
		presentation: {
			accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-burpee-big-boy-tomato.png',
			size: 2,
		},
	},
	{
		id: 'plant_tomatoes-rareseeds-cherokee-purple-tomato',
		displayName: 'Cherokee Purple Tomato',
		category: 'tomatoes',
		variant: 'rareseeds-cherokee-purple-tomato',
		size: 2,
		presentation: {
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-rareseeds-cherokee-purple-tomato.png',
			size: 2,
		},
	},
	{
		id: 'plant_tomatoes-sweet-100-tomato',
		displayName: 'Sweet 100 Cherry Tomato',
		category: 'tomatoes',
		variant: 'sweet-100-tomato',
		size: 2,
		presentation: {
			accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
			iconPath: 'tomatoes-sweet-100-tomato.png',
			size: 2,
		},
	},
	{
		id: 'plant_tomatoes-napa-chardonnay-tomato',
		displayName: 'Napa Chardonnay Tomato',
		category: 'tomatoes',
		variant: 'napa-chardonnay-tomato',
		size: 2,
		presentation: {
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-tomatoes-yellow
			iconPath: 'tomatoes-napa-chardonnay-tomato.png',
			size: 2,
		},
	},
	{
		id: 'plant_tomatoes-black-from-tula-tomato',
		displayName: 'Black from Tula Tomato',
		category: 'tomatoes',
		variant: 'black-from-tula-tomato',
		size: 2,
		presentation: {
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-tomatoes-purple
			iconPath: 'tomatoes-black-from-tula-tomato.png',
			size: 2,
		},
	},

	// Lettuce & Greens
	{
		id: 'plant_lettuce-burpee-buttercrunch-lettuce',
		displayName: 'Buttercrunch Lettuce',
		category: 'lettuce',
		variant: 'burpee-buttercrunch-lettuce',
		size: 1,
		presentation: {
			accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
			iconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
			size: 1,
		},
	},
	{
		id: 'plant_arugula-arugula',
		displayName: 'Arugula',
		category: 'arugula',
		variant: 'arugula',
		size: 1,
		presentation: {
			accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
			iconPath: 'arugula-arugula.png',
			size: 1,
		},
	},
	{
		id: 'plant_spinach-spinach',
		displayName: 'Spinach',
		category: 'spinach',
		variant: 'spinach',
		size: 1,
		presentation: {
			accentColor: { red: 56, green: 142, blue: 60 }, // --color-spinach-green
			iconPath: 'spinach-spinach.png',
			size: 1,
		},
	},
	{
		id: 'plant_spinach-japanese-perpetual-spinach',
		displayName: 'Japanese Perpetual Spinach',
		category: 'spinach',
		variant: 'japanese-perpetual-spinach',
		size: 1,
		presentation: {
			accentColor: { red: 56, green: 142, blue: 60 }, // --color-spinach-green
			iconPath: 'spinach-japanese-perpetual-spinach.png',
			size: 1,
		},
	},

	// Carrots
	{
		id: 'plant_carrots-burpee-chantenay-carrot',
		displayName: 'Chantenay Red Core Carrot',
		category: 'carrots',
		variant: 'burpee-chantenay-carrot',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 167, blue: 38 }, // --color-carrots-orange
			iconPath: 'carrots-burpee-chantenay-carrot.png',
			size: 1,
		},
	},
	{
		id: 'plant_carrots-parisienne-carrots',
		displayName: 'Parisienne Carrots',
		category: 'carrots',
		variant: 'parisienne-carrots',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 167, blue: 38 }, // --color-carrots-orange
			iconPath: 'carrots-parisienne-carrots.png',
			size: 1,
		},
	},
	{
		id: 'plant_carrots-lila-lu-sang-carrots',
		displayName: 'Lila Lu Sang Purple Carrots',
		category: 'carrots',
		variant: 'lila-lu-sang-carrots',
		size: 1,
		presentation: {
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-carrots-purple
			iconPath: 'carrots-lila-lu-sang-carrots.png',
			size: 1,
		},
	},

	// Peppers
	{
		id: 'plant_peppers-burpee-california-wonder-pepper',
		displayName: 'California Wonder Bell Pepper',
		category: 'peppers',
		variant: 'burpee-california-wonder-pepper',
		size: 1,
		presentation: {
			accentColor: { red: 58, green: 145, blue: 63 }, // --color-peppers-green
			iconPath: 'peppers-burpee-california-wonder-pepper.png',
			size: 1,
		},
	},
	{
		id: 'plant_peppers-jalapeno-hot-pepper',
		displayName: 'Jalapeño Hot Pepper',
		category: 'peppers',
		variant: 'jalapeno-hot-pepper',
		size: 1,
		presentation: {
			accentColor: { red: 58, green: 145, blue: 63 }, // --color-peppers-green
			iconPath: 'peppers-jalapeno-hot-pepper.png',
			size: 1,
		},
	},
	{
		id: 'plant_peppers-habanero-hot-pepper',
		displayName: 'Habanero Hot Pepper',
		category: 'peppers',
		variant: 'habanero-hot-pepper',
		size: 1,
		presentation: {
			accentColor: { red: 247, green: 92, blue: 3 }, // --color-peppers-orange
			iconPath: 'peppers-habanero-hot-pepper.png',
			size: 1,
		},
	},
	{
		id: 'plant_peppers-lemon-drop-hot-pepper',
		displayName: 'Lemon Drop Hot Pepper',
		category: 'peppers',
		variant: 'lemon-drop-hot-pepper',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-peppers-yellow
			iconPath: 'peppers-lemon-drop-hot-pepper.png',
			size: 1,
		},
	},
	{
		id: 'plant_peppers-buena-mulata-hot-pepper',
		displayName: 'Buena Mulata Hot Pepper',
		category: 'peppers',
		variant: 'buena-mulata-hot-pepper',
		size: 1,
		presentation: {
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-peppers-purple
			iconPath: 'peppers-buena-mulata-hot-pepper.png',
			size: 1,
		},
	},

	// Beans
	{
		id: 'plant_beans-burpee-provider-bush-bean',
		displayName: 'Provider Bush Bean',
		category: 'beans',
		variant: 'burpee-provider-bush-bean',
		size: 1,
		presentation: {
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-burpee-provider-bush-bean.png',
			size: 1,
		},
	},
	{
		id: 'plant_beans-fava-beans',
		displayName: 'Fava Beans',
		category: 'beans',
		variant: 'fava-beans',
		size: 1,
		presentation: {
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-fava-beans.png',
			size: 1,
		},
	},
	{
		id: 'plant_beans-dragons-tongue-beans',
		displayName: "Dragon's Tongue Bush Bean",
		category: 'beans',
		variant: 'dragons-tongue-beans',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-beans-yellow
			iconPath: 'beans-dragons-tongue-beans.png',
			size: 1,
		},
	},
	{
		id: 'plant_beans-cherokee-trail-of-tears-beans',
		displayName: 'Cherokee Trail of Tears Bean',
		category: 'beans',
		variant: 'cherokee-trail-of-tears-beans',
		size: 1,
		presentation: {
			accentColor: { red: 128, green: 0, blue: 128 }, // --color-beans-purple
			iconPath: 'beans-cherokee-trail-of-tears-beans.png',
			size: 1,
		},
	},
	{
		id: 'plant_beans-scarlet-runner-beans',
		displayName: 'Scarlet Runner Bean',
		category: 'beans',
		variant: 'scarlet-runner-beans',
		size: 1,
		presentation: {
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-beans-green
			iconPath: 'beans-scarlet-runner-beans.png',
			size: 1,
		},
	},

	// Onions & Alliums
	{
		id: 'plant_onions-rareseeds-yellow-of-parma-onion',
		displayName: 'Yellow of Parma Onion',
		category: 'onions',
		variant: 'rareseeds-yellow-of-parma-onion',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 212, blue: 0 }, // --color-onions-yellow
			iconPath: 'onions-rareseeds-yellow-of-parma-onion.png',
			size: 1,
		},
	},
	{
		id: 'plant_onions-burpee-evergreen-hardy-white-scallions',
		displayName: 'Evergreen Hardy White Scallions',
		category: 'onions',
		variant: 'burpee-evergreen-hardy-white-scallions',
		size: 1,
		presentation: {
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-burpee-evergreen-hardy-white-scallions.png',
			size: 1,
		},
	},
	{
		id: 'plant_onions-chives',
		displayName: 'Chives',
		category: 'onions',
		variant: 'chives',
		size: 1,
		presentation: {
			accentColor: { red: 86, green: 130, blue: 3 }, // --color-mint-green
			iconPath: 'onions-chives.png',
			size: 1,
		},
	},
	{
		id: 'plant_onions-garlic',
		displayName: 'Garlic',
		category: 'onions',
		variant: 'garlic',
		size: 1,
		presentation: {
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-garlic.png',
			size: 1,
		},
	},
	{
		id: 'plant_onions-bunching-onion',
		displayName: 'Bunching Onion',
		category: 'onions',
		variant: 'bunching-onion',
		size: 1,
		presentation: {
			accentColor: { red: 245, green: 245, blue: 245 }, // --color-onions-white
			iconPath: 'onions-bunching-onion.png',
			size: 1,
		},
	},

	// Fruits
	{
		id: 'plant_cherries-rainier-cherry',
		displayName: 'Rainier Cherry',
		category: 'cherries',
		variant: 'rainier-cherry',
		size: 3,
		presentation: {
			accentColor: { red: 255, green: 192, blue: 203 }, // --color-cherries-pink
			iconPath: 'cherries-rainier-cherry.png',
			size: 3,
		},
	},
	{
		id: 'plant_strawberries-alexandria-strawberry',
		displayName: 'Alexandria Strawberry',
		category: 'strawberries',
		variant: 'alexandria-strawberry',
		size: 1,
		presentation: {
			accentColor: { red: 220, green: 20, blue: 60 }, // --color-strawberries-red
			iconPath: 'strawberries-alexandria-strawberry.png',
			size: 1,
		},
	},

	// Flowers
	{
		id: 'plant_daisies-zinnia-2',
		displayName: 'Zinnia',
		category: 'daisies',
		variant: 'zinnia',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 105, blue: 180 },
			iconPath: 'daisies-zinnia.png',
			size: 1,
		},
	},
	// --- ADDED FROM seeds.yml ---
	{
		id: 'plant_basil',
		displayName: 'Basil',
		category: 'basil',
		variant: 'basil',
		size: 1,
		presentation: {
			accentColor: { red: 85, green: 107, blue: 47 },
			iconPath: 'basil-basil.png',
			size: 1,
		},
	},
	{
		id: 'plant_foxglove',
		displayName: 'Foxglove',
		category: 'snapdragons',
		variant: 'foxglove',
		size: 2,
		presentation: {
			accentColor: { red: 186, green: 85, blue: 211 },
			iconPath: 'snapdragons-foxglove.png',
			size: 2,
		},
	},
	{
		id: 'plant_zinnia',
		displayName: 'Zinnia',
		category: 'daisies',
		variant: 'zinnia',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 105, blue: 180 },
			iconPath: 'daisies-zinnia.png',
			size: 1,
		},
	},
	{
		id: 'plant_watermelon',
		displayName: 'Watermelon',
		category: 'watermelons',
		variant: 'watermelon',
		size: 4,
		presentation: {
			accentColor: { red: 50, green: 205, blue: 50 },
			iconPath: 'watermelons-watermelon.png',
			size: 4,
		},
	},
	{
		id: 'plant_wheat',
		displayName: 'Wheat',
		category: 'grains',
		variant: 'wheat',
		size: 1,
		presentation: {
			accentColor: { red: 222, green: 184, blue: 135 },
			iconPath: 'grains-wheat.png',
			size: 1,
		},
	},
	{
		id: 'plant_broccoli',
		displayName: 'Broccoli',
		category: 'brassicas',
		variant: 'broccoli',
		size: 2,
		presentation: {
			accentColor: { red: 85, green: 107, blue: 47 },
			iconPath: 'broccoli-broccoli.png',
			size: 2,
		},
	},
	{
		id: 'plant_sunflower',
		displayName: 'Sunflower',
		category: 'sunflowers',
		variant: 'sunflower',
		size: 2,
		presentation: {
			accentColor: { red: 255, green: 215, blue: 0 },
			iconPath: 'sunflowers-sunflower.png',
			size: 2,
		},
	},
	{
		id: 'plant_lupine',
		displayName: 'Lupine',
		category: 'legumes',
		variant: 'lupine',
		size: 2,
		presentation: {
			accentColor: { red: 123, green: 104, blue: 238 },
			iconPath: 'legumes-lupine.png',
			size: 2,
		},
	},
	{
		id: 'plant_rutabaga',
		displayName: 'Rutabaga',
		category: 'turnips',
		variant: 'rutabaga',
		size: 1,
		presentation: {
			accentColor: { red: 238, green: 232, blue: 170 },
			iconPath: 'rutabagas-rutabaga.png',
			size: 1,
		},
	},
	{
		id: 'plant_celery',
		displayName: 'Celery',
		category: 'celery',
		variant: 'celery',
		size: 1,
		presentation: {
			accentColor: { red: 144, green: 238, blue: 144 },
			iconPath: 'celery-celery.png',
			size: 1,
		},
	},
	{
		id: 'plant_marigold',
		displayName: 'Marigold',
		category: 'marigolds',
		variant: 'marigold',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 140, blue: 0 },
			iconPath: 'marigolds-marigold.png',
			size: 1,
		},
	},
	{
		id: 'plant_cilantro',
		displayName: 'Cilantro',
		category: 'cilantro',
		variant: 'cilantro',
		size: 1,
		presentation: {
			accentColor: { red: 34, green: 139, blue: 34 },
			iconPath: 'cilantro-cilantro.png',
			size: 1,
		},
	},
	{
		id: 'plant_brassicas-bok-choy',
		displayName: 'Bok Choy',
		category: 'brassicas',
		variant: 'bok-choy',
		size: 1,
		presentation: {
			accentColor: { red: 152, green: 251, blue: 152 },
			iconPath: 'brassicas-bok-choy.png',
			size: 1,
		},
	},
	{
		id: 'plant_peas',
		displayName: 'Super Sugar Snap Pea',
		category: 'peas',
		variant: 'super-sugar-snap',
		size: 1,
		presentation: {
			accentColor: { red: 123, green: 182, blue: 97 },
			iconPath: 'peas-burpee-sugar-snap-peas.png',
			size: 1,
		},
	},
	{
		id: 'plant_dahlia',
		displayName: 'Dahlia',
		category: 'dasies',
		variant: 'dahlia',
		size: 1,
		presentation: {
			accentColor: { red: 255, green: 87, blue: 34 },
			iconPath: 'daisies-dahlia.png',
			size: 1,
		},
	},
]

export const seedPackets: SeedPacket[] = [
	{
		id: 'seedp_0',
		name: 'Celery Seeds',
		quantity: 10,
		presentation: {
			iconPath: 'celery-celery.png',
			accentColor: { red: 144, green: 238, blue: 144 },
		},
		netWeightGrams: 10,
		originLocation: 'Colombia',
		description: 'Celery seeds are a great way to add some green to your garden.',
		plantingInstructions: 'Sow seeds 1/2 inch deep in soil.',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
		plantFamily: 'celery',
		plantingDistance: {
			value: 1,
			unit: 'feet',
		},
	},
	{
		id: 'seedp_1',
		name: 'Big Boy Tomato',
		quantity: 30, // from seedPacketInfo.seedCount
		presentation: {
			iconPath: 'tomatoes-burpee-big-boy-tomato.png',
			accentColor: { red: 255, green: 99, blue: 71 }, // Tomato red
		},
		netWeightGrams: 1, // Placeholder, not directly in YAML for this item
		originLocation: 'USA', // Placeholder, not directly in YAML
		description:
			'Classic indeterminate beefsteak tomato producing large, meaty fruits up to 1 pound. Excellent for slicing and sandwiches.',
		plantingInstructions: 'Sow seeds 1/4 inch deep.', // from planting.seedDepth
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
		plantFamily: 'tomatoes',
		plantingDistance: {
			value: 2,
			unit: 'feet',
		},
	},
	{
		id: 'seedp_2',
		name: 'Basil',
		quantity: 100, // from seedPacketInfo.seedCount
		presentation: {
			iconPath: 'basil-basil.png',
			accentColor: { red: 133, green: 187, blue: 101 }, // Basil green
		},
		netWeightGrams: 0.5, // Placeholder
		originLocation: 'India', // Placeholder
		description:
			'Aromatic annual herb with excellent culinary uses. Natural pest deterrent and pollinator attractor.',
		plantingInstructions: 'Sow seeds 1/4 inch deep.', // from planting.seedDepth
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
		plantFamily: 'basil',
		plantingDistance: {
			value: 1,
			unit: 'feet',
		},
	},
]

export const gardens: Workspace[] = [
	{
		id: 'grdn_0',
		indicators: [
			{
				id: 'indicator_0',
				zoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
				effects: [
					{
						sourceItemId: 'plant_placement_1aac58bc-ad63-4fa9-8927-793d19cc841b', // lettuce
						targetItemId: 'plant_placement_c7bc1a01-38e3-47bb-93cd-992334b4babb', // tomato
						nature: 'beneficial',
						description: 'Lettuce provides a living mulch, suppressing weeds.',
					},
					{
						sourceItemId: 'plant_placement_c7bc1a01-38e3-47bb-93cd-992334b4babb', // tomato
						targetItemId: 'plant_placement_1aac58bc-ad63-4fa9-8927-793d19cc841b', // lettuce
						nature: 'beneficial',
						description: 'Tomatoes provide shade for lettuce.',
					},
				],
			},
			{
				id: 'indicator_1',
				zoneId: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
				effects: [
					{
						sourceItemId: 'plant_placement_f41c815b-6774-4017-bf19-067ac3f81099',
						targetItemId: 'plant_placement_4c957f8b-1b4f-4a8a-aa92-70eefcb052b7',
						nature: 'neutral',
						description: 'Arugula and Spinach have similar needs and do not interfere.',
					},
					{
						sourceItemId: 'plant_placement_4c957f8b-1b4f-4a8a-aa92-70eefcb052b7',
						targetItemId: 'plant_placement_f41c815b-6774-4017-bf19-067ac3f81099',
						nature: 'neutral',
						description: 'Arugula and Spinach have similar needs and do not interfere.',
					},
				],
			},
			{
				id: 'indicator_2',
				zoneId: 'bed_complex_interaction',
				effects: [
					{
						sourceItemId: 'plant_placement_dahlia',
						targetItemId: 'plant_placement_broccoli',
						nature: 'beneficial',
						description: 'Dahlia deters pests that affect Broccoli.',
					},
					{
						sourceItemId: 'plant_placement_garlic',
						targetItemId: 'plant_placement_peas',
						nature: 'harmful',
						description:
							'Garlic releases chemicals that can kill needed soil bacteria for peas.',
					},
					{
						sourceItemId: 'plant_placement_garlic',
						targetItemId: 'plant_placement_broccoli',
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
				waterLevel: 0,
				sunLevel: 2,
				placements: [],
			},
			{
				id: 'bed_ee059cdd-d907-4c1a-99c5-5cfb34c47b2d',
				width: 1,
				height: 1,
				waterLevel: 0,
				sunLevel: 0,
				placements: [
					{
						id: 'plant_placement_c806fc0b-b50d-489c-9aa4-30e9448769ae',
						x: 0,
						y: 0,
						size: 2,
						item: createPlantItem({
							id: 'plant_tomatoes-burpee-big-boy-tomato',
							displayName: 'Big Boy Tomato',
							family: 'tomatoes',
							variant: 'burpee-big-boy-tomato',
							plantingDistanceInFeet: 2,
							presentation: {
								accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
								iconPath: 'tomatoes-burpee-big-boy-tomato.png',
								size: 2,
							},
						}),
						sourceZoneId: 'bed_ee059cdd-d907-4c1a-99c5-5cfb34c47b2d',
					},
				],
			},
			{
				id: 'bed_642de3aa-1d4e-44bc-b40a-db89c23c8aa4',
				width: 1,
				height: 1,
				waterLevel: 0,
				sunLevel: 0,
				placements: [
					{
						id: 'plant_placement_16cee04a-c890-478e-9ac6-3ee02b3e0db6',
						x: 0,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_lettuce-burpee-buttercrunch-lettuce',
							displayName: 'Buttercrunch Lettuce',
							family: 'lettuce',
							variant: 'burpee-buttercrunch-lettuce',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
								iconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_642de3aa-1d4e-44bc-b40a-db89c23c8aa4',
					},
				],
			},
			{
				id: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
				width: 6,
				height: 2,
				waterLevel: 2,
				sunLevel: 4,
				placements: [
					{
						id: 'plant_placement_c7bc1a01-38e3-47bb-93cd-992334b4babb',
						x: 0,
						y: 0,
						size: 2,
						item: createPlantItem({
							plantingDistanceInFeet: 2,
							id: 'plant_tomatoes-burpee-big-boy-tomato',
							displayName: 'Big Boy Tomato',
							family: 'tomatoes',
							variant: 'burpee-big-boy-tomato',
							presentation: {
								accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
								iconPath: 'tomatoes-burpee-big-boy-tomato.png',
								size: 2,
							},
						}),
						sourceZoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
					},
					{
						id: 'plant_placement_1aac58bc-ad63-4fa9-8927-793d19cc841b',
						x: 2,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_lettuce-burpee-buttercrunch-lettuce',
							displayName: 'Buttercrunch Lettuce',
							family: 'lettuce',
							variant: 'burpee-buttercrunch-lettuce',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
								iconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_34b81532-496a-488c-8c71-ab8044a8c5a6',
					},
				],
			},
			{
				id: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
				width: 6,
				height: 2,
				waterLevel: 2,
				sunLevel: 4,
				placements: [
					{
						id: 'plant_placement_f41c815b-6774-4017-bf19-067ac3f81099',
						x: 0,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_arugula-arugula',
							displayName: 'Arugula',
							family: 'arugula',
							variant: 'arugula',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
								iconPath: 'arugula-arugula.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
					},
					{
						id: 'plant_placement_4c957f8b-1b4f-4a8a-aa92-70eefcb052b7',
						x: 2,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_spinach-japanese-perpetual-spinach',
							displayName: 'Japanese Perpetual Spinach',
							family: 'spinach',
							variant: 'japanese-perpetual-spinach',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 56, green: 142, blue: 60 }, // --color-spinach-green
								iconPath: 'spinach-japanese-perpetual-spinach.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_6a288fa4-d503-4be5-b7fe-2c9a4db8919f',
					},
				],
			},
			{
				id: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
				width: 12,
				height: 4,
				waterLevel: 3,
				sunLevel: 3,
				placements: [
					{
						id: 'plant_placement_f2321084-5ff0-4328-b90a-776de35d8f81',
						x: 2,
						y: 1,
						size: 3,
						item: createPlantItem({
							id: 'plant_cherries-rainier-cherry',
							displayName: 'Rainier Cherry',
							family: 'cherries',
							variant: 'rainier-cherry',
							plantingDistanceInFeet: 3,
							presentation: {
								accentColor: { red: 255, green: 192, blue: 203 }, // --color-cherries-pink
								iconPath: 'cherries-rainier-cherry.png',
								size: 3,
							},
						}),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
					{
						id: 'plant_placement_86b880d5-77c0-487d-8fdd-34260c9c0bc6',
						x: 0,
						y: 0,
						size: 2,
						item: createPlantItem({
							id: 'plant_tomatoes-burpee-big-boy-tomato',
							displayName: 'Big Boy Tomato',
							family: 'tomatoes',
							variant: 'burpee-big-boy-tomato',
							plantingDistanceInFeet: 2,
							presentation: {
								accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
								iconPath: 'tomatoes-burpee-big-boy-tomato.png',
								size: 2,
							},
						}),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
					{
						id: 'plant_placement_e2ab8f6e-513d-4dff-9a76-d78f741eee13',
						x: 2,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_lettuce-burpee-buttercrunch-lettuce',
							displayName: 'Buttercrunch Lettuce',
							family: 'lettuce',
							variant: 'burpee-buttercrunch-lettuce',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 123, green: 182, blue: 97 }, // --color-lettuce-green
								iconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},

					{
						id: 'plant_placement_3ca27ca0-6438-47d8-8b90-7af77b24f430',
						x: 6,
						y: 0,
						size: 1,
						item: createPlantItem({
							id: 'plant_strawberries-alexandria-strawberry',
							displayName: 'Alexandria Strawberry',
							family: 'strawberries',
							variant: 'alexandria-strawberry',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
								iconPath: 'strawberries-alexandria-strawberry.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},

					{
						id: 'plant_placement_224254bb-e30b-44ab-8b6c-f9988bb49f2a',
						x: 6,
						y: 3,
						size: 1,
						item: createPlantItem({
							id: 'plant_daisies-zinnia-2',
							displayName: 'Zinnia',
							family: 'daisies',
							variant: 'zinnia',
							plantingDistanceInFeet: 1,
							presentation: {
								accentColor: { red: 214, green: 40, blue: 40 }, // --color-tomatoes-red
								iconPath: 'daisies-zinnia.png',
								size: 1,
							},
						}),
						sourceZoneId: 'bed_49442534-ba8e-47ee-8613-1be8bcf7fd3e',
					},
				],
			},
			{
				id: 'bed_complex_interaction',
				width: 2,
				height: 2,
				waterLevel: 0,
				sunLevel: 0,
				placements: [
					{
						id: 'plant_placement_garlic',
						x: 0,
						y: 1,
						size: 1,
						item: plants.find((p) => p.id === 'plant_onions-garlic') as Item,
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_dahlia',
						x: 1,
						y: 1,
						size: 1,
						item: plants.find((p) => p.id === 'plant_dahlia') as Item,
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_broccoli',
						x: 0,
						y: 0,
						size: 1,
						item: plants.find((p) => p.id === 'plant_broccoli') as Item,
						sourceZoneId: 'bed_complex_interaction',
					},
					{
						id: 'plant_placement_peas',
						x: 1,
						y: 0,
						size: 1,
						item: plants.find((p) => p.id === 'plant_peas') as Item,
						sourceZoneId: 'bed_complex_interaction',
					},
				],
			},
		],
	},
]
