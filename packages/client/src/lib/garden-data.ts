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
}
