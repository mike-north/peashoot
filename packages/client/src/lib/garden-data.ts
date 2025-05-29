import type { Garden } from '../private-lib/garden'
import { timeout } from '../utils/promise'

export async function fetchGardens(): Promise<Garden[]> {
	await timeout(300) // Fake delay to simulate network call

	return [
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
					id: 'bed_-2',
					width: 12,
					height: 2,
					waterLevel: 0,
					sunLevel: 0,
					plantPlacements: [],
				},
				{
					id: 'bed_-1',
					width: 1,
					height: 1,
					waterLevel: 0,
					sunLevel: 0,
					plantPlacements: [
						{
							id: 'placeholder_000',
							x: 0,
							y: 0,
							plantTile: {
								id: 'lettuce_0',
								name: 'lettuce',
								icon: '🌱',
								size: 1,
								plantFamily: { name: 'lettuce', colorVariant: 'green' },
							},
						},
					],
				},
				{
					id: 'bed_0',
					width: 1,
					height: 1,
					waterLevel: 0,
					sunLevel: 0,
					plantPlacements: [
						{
							id: 'placeholder_0',
							x: 0,
							y: 0,
							plantTile: {
								id: 'lettuce_0',
								name: 'lettuce',
								icon: '🌱',
								size: 1,
								plantFamily: { name: 'lettuce', colorVariant: 'green' },
							},
						},
					],
				},
				{
					id: 'bed_1',
					width: 6,
					height: 2,
					waterLevel: 2,
					sunLevel: 4,
					plantPlacements: [
						{
							id: 'tomato_1',
							x: 0,
							y: 0,
							plantTile: {
								id: 'tomato',
								name: 'tomato',
								icon: '🍅',
								size: 2,
								plantFamily: { name: 'tomatoes', colorVariant: 'red' },
							},
						},
						{
							id: 'lettuce_1',
							x: 2,
							y: 0,
							plantTile: {
								id: 'lettuce',
								name: 'lettuce',
								icon: '🥬',
								size: 1,
								plantFamily: { name: 'lettuce', colorVariant: 'green' },
							},
						},
					],
				},
				{
					id: 'bed_2',
					width: 6,
					height: 2,
					waterLevel: 2,
					sunLevel: 4,
					plantPlacements: [
						{
							id: 'tomato_44',
							x: 0,
							y: 0,
							plantTile: {
								id: 'tomato',
								name: 'tomato',
								icon: '🍅',
								size: 2,
								plantFamily: { name: 'tomatoes', colorVariant: 'red' },
							},
						},
						{
							id: 'lettuce_44',
							x: 2,
							y: 0,
							plantTile: {
								id: 'lettuce',
								name: 'lettuce',
								icon: '🥬',
								size: 1,
								plantFamily: { name: 'lettuce', colorVariant: 'green' },
							},
						},
					],
				},
				{
					id: 'bed_3',
					width: 12,
					height: 4,
					waterLevel: 3,
					sunLevel: 3,
					plantPlacements: [
						{
							id: 'bing_cherry_1',
							x: 2,
							y: 1,
							plantTile: {
								id: 'cherry',
								name: 'cherry',
								icon: '🍒',
								size: 3,
								plantFamily: { name: 'cherries', colorVariant: 'red' },
							},
						},
						{
							id: 'tomato_2',
							x: 0,
							y: 0,
							plantTile: {
								id: 'tomato',
								name: 'tomato',
								icon: '🍅',
								size: 2,
								plantFamily: { name: 'tomatoes', colorVariant: 'red' },
							},
						},
						{
							id: 'lettuce_2',
							x: 2,
							y: 0,
							plantTile: {
								id: 'lettuce',
								name: 'lettuce',
								icon: '🥬',
								size: 1,
								plantFamily: { name: 'lettuce', colorVariant: 'green' },
							},
						},

						{
							id: 'strawberry_1',
							x: 6,
							y: 0,
							plantTile: {
								id: 'strawberry',
								name: 'Strawberry',
								icon: '🍓',
								size: 1,
								plantFamily: { name: 'strawberries', colorVariant: 'red' },
							},
						},

						{
							id: 'daisy_1',
							x: 6,
							y: 3,
							plantTile: {
								id: 'daisy',
								name: 'Daisy',
								icon: '🌼',
								size: 1,
								plantFamily: { name: 'daisies', colorVariant: 'white' },
							},
						},
					],
				},
			],
		},
	]
}
