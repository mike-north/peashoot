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
				accentColor: 'rgb(214 40 40)', // --color-tomatoes-red
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
				accentColor: 'rgb(128 0 128)', // --color-tomatoes-purple
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
				accentColor: 'rgb(214 40 40)', // --color-tomatoes-red
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
				accentColor: 'rgb(255 212 0)', // --color-tomatoes-yellow
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
				accentColor: 'rgb(128 0 128)', // --color-tomatoes-purple
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
				accentColor: 'rgb(123 182 97)', // --color-lettuce-green
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
				accentColor: 'rgb(123 182 97)', // --color-lettuce-green
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
				accentColor: 'rgb(56 142 60)', // --color-spinach-green
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
				accentColor: 'rgb(56 142 60)', // --color-spinach-green
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
				accentColor: 'rgb(255 167 38)', // --color-carrots-orange
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
				accentColor: 'rgb(255 167 38)', // --color-carrots-orange
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
				accentColor: 'rgb(128 0 128)', // --color-carrots-purple
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
				accentColor: 'rgb(58 145 63)', // --color-peppers-green
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
				accentColor: 'rgb(58 145 63)', // --color-peppers-green
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
				accentColor: 'rgb(247 92 3)', // --color-peppers-orange
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
				accentColor: 'rgb(255 212 0)', // --color-peppers-yellow
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
				accentColor: 'rgb(128 0 128)', // --color-peppers-purple
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
				accentColor: 'rgb(86 130 3)', // --color-beans-green
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
				accentColor: 'rgb(86 130 3)', // --color-beans-green
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
				accentColor: 'rgb(255 212 0)', // --color-beans-yellow
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
				accentColor: 'rgb(128 0 128)', // --color-beans-purple
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
				accentColor: 'rgb(86 130 3)', // --color-beans-green
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
				accentColor: 'rgb(255 212 0)', // --color-onions-yellow
				tileIconPath: 'onions-rareseeds-yellow-of-parma-onion.png',
			},
		},
		{
			id: 'onions-burpee-evergreen-hardy-white-scallions',
			displayName: 'Evergreen Hardy White Scallions',
			family: 'onions',
			variant: 'burpee-evergreen-hardy-white-scallions',
			plantingDistanceInFeet: 0.25,
			presentation: {
				accentColor: 'rgb(245 245 245)', // --color-onions-white
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
				accentColor: 'rgb(86 130 3)', // --color-mint-green
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
				accentColor: 'rgb(245 245 245)', // --color-onions-white
				tileIconPath: 'onions-garlic.png',
			},
		},
		{
			id: 'onions-bunching-onion',
			displayName: 'Bunching Onion',
			family: 'onions',
			variant: 'bunching-onion',
			plantingDistanceInFeet: 0.25,
			presentation: {
				accentColor: 'rgb(245 245 245)', // --color-onions-white
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
				accentColor: 'rgb(255 192 203)', // --color-cherries-pink
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
				accentColor: 'rgb(220 20 60)', // --color-strawberries-red
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
				accentColor: 'rgb(255 20 147)', // --color-daisies-pink
				tileIconPath: 'daisies-zinnia.png',
			},
		},
	]
}
