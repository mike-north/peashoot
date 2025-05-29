import type { Garden } from '../private-lib/garden'
import { timeout } from '../utils/promise'
import { makeUniqueId } from './id'


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
					id: makeUniqueId('bed'),
					width: 12,
					height: 2,
					waterLevel: 0,
					sunLevel: 2,
					plantPlacements: [],
				},
				{
					id: makeUniqueId('bed'),
					width: 1,
					height: 1,
					waterLevel: 0,
					sunLevel: 0,
					plantPlacements: [
						{
							id: makeUniqueId('plant_placement'),
							x: 0,
							y: 0,
							plantId: 'tomatoes-burpee-big-boy-tomato',
						},
					],
				},
				{
					id: makeUniqueId('bed'),
					width: 1,
					height: 1,
					waterLevel: 0,
					sunLevel: 0,
					plantPlacements: [
						{
							id: makeUniqueId('plant_placement'),
							x: 0,
							y: 0,
							plantId: 'lettuce-burpee-buttercrunch-lettuce',
						},
					],
				},
				{
					id: makeUniqueId('bed'),
					width: 6,
					height: 2,
					waterLevel: 2,
					sunLevel: 4,
					plantPlacements: [
						{
							id: makeUniqueId('plant_placement'),
							x: 0,
							y: 0,
							plantId: 'tomatoes-burpee-big-boy-tomato',
						},
						{
							id: makeUniqueId('plant_placement'),
							x: 2,
							y: 0,
							plantId: 'lettuce-burpee-buttercrunch-lettuce',
						},
					],
				},
				{
					id: makeUniqueId('bed'),
					width: 6,
					height: 2,
					waterLevel: 2,
					sunLevel: 4,
					plantPlacements: [
						{
							id: makeUniqueId('plant_placement'),
							x: 0,
							y: 0,
							plantId: 'arugula-arugula',
						},
						{
							id: makeUniqueId('plant_placement'),
							x: 2,
							y: 0,
							plantId: 'spinach-japanese-perpetual-spinach',
						},
					],
				},
				{
					id: makeUniqueId('bed'),
					width: 12,
					height: 4,
					waterLevel: 3,
					sunLevel: 3,
					plantPlacements: [
						{
							id: makeUniqueId('plant_placement'),
							x: 2,
							y: 1,
							plantId: 'cherries-rainier-cherry',
						},
						{
							id: makeUniqueId('plant_placement'),
							x: 0,
							y: 0,
							plantId: 'tomatoes-burpee-big-boy-tomato',
						},
						{
							id: makeUniqueId('plant_placement'),
							x: 2,
							y: 0,
							plantId: 'lettuce-burpee-buttercrunch-lettuce',
						},

						{
							id: makeUniqueId('plant_placement'),
							x: 6,
							y: 0,
							plantId: 'strawberries-alexandria-strawberry',
						},

						{
							id: makeUniqueId('plant_placement'),
							x: 6,
							y: 3,
							plantId: 'daisies-zinnia',
						},
					],
				},
			],
		},
	]
}
