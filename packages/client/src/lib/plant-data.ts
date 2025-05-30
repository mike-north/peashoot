import { timeout } from '../utils/promise'
import type { Plant } from '../private-lib/plant'

export async function fetchPlants(): Promise<Plant[]> {
	await timeout(300) // Fake delay to simulate network call
	return [
		// Tomatoes
		{
			id: 'tomatoes-burpee-big-boy-tomato',
			displayName: 'Big Boy Tomato',
			family: 'tomatoes',
			variant: 'burpee-big-boy-tomato',
			plantingDistanceInFeet: 2,
			presentation: {
				accentColor: { r: 214, g: 40, b: 40 }, // --color-tomatoes-red
				tileIconPath: 'tomatoes-burpee-big-boy-tomato.png',
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
				tileIconPath: 'tomatoes-rareseeds-cherokee-purple-tomato.png',
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
				tileIconPath: 'tomatoes-sweet-100-tomato.png',
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
				tileIconPath: 'tomatoes-napa-chardonnay-tomato.png',
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
				tileIconPath: 'tomatoes-black-from-tula-tomato.png',
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
				tileIconPath: 'lettuce-burpee-buttercrunch-lettuce.png',
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
				tileIconPath: 'arugula-arugula.png',
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
				tileIconPath: 'spinach-spinach.png',
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
				tileIconPath: 'spinach-japanese-perpetual-spinach.png',
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
				tileIconPath: 'carrots-burpee-chantenay-carrot.png',
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
				tileIconPath: 'carrots-parisienne-carrots.png',
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
				tileIconPath: 'carrots-lila-lu-sang-carrots.png',
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
				tileIconPath: 'peppers-burpee-california-wonder-pepper.png',
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
				tileIconPath: 'peppers-jalapeno-hot-pepper.png',
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
				tileIconPath: 'peppers-habanero-hot-pepper.png',
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
				tileIconPath: 'peppers-lemon-drop-hot-pepper.png',
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
				tileIconPath: 'peppers-buena-mulata-hot-pepper.png',
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
				tileIconPath: 'beans-burpee-provider-bush-bean.png',
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
				tileIconPath: 'beans-fava-beans.png',
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
				tileIconPath: 'beans-dragons-tongue-beans.png',
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
				tileIconPath: 'beans-cherokee-trail-of-tears-beans.png',
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
				tileIconPath: 'beans-scarlet-runner-beans.png',
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
				tileIconPath: 'onions-rareseeds-yellow-of-parma-onion.png',
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
				tileIconPath: 'onions-burpee-evergreen-hardy-white-scallions.png',
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
				tileIconPath: 'onions-chives.png',
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
				tileIconPath: 'onions-garlic.png',
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
				tileIconPath: 'onions-bunching-onion.png',
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
				tileIconPath: 'cherries-rainier-cherry.png',
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
				tileIconPath: 'strawberries-alexandria-strawberry.png',
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
				tileIconPath: 'daisies-zinnia.png',
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
				tileIconPath: 'basil-basil.png',
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
				tileIconPath: 'snapdragons-foxglove.png',
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
				tileIconPath: 'daisies-zinnia.png',
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
				tileIconPath: 'watermelons-watermelon.png',
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
				tileIconPath: 'grains-wheat.png',
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
				tileIconPath: 'broccoli-broccoli.png',
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
				tileIconPath: 'sunflowers-sunflower.png',
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
				tileIconPath: 'legumes-lupine.png',
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
				tileIconPath: 'rutabagas-rutabaga.png',
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
				tileIconPath: 'celery-celery.png',
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
				tileIconPath: 'marigolds-marigold.png',
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
				tileIconPath: 'cilantro-cilantro.png',
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
				tileIconPath: 'brassicas-bok-choy.png',
			},
		},
	]
}
