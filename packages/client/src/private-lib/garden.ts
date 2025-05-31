import type { GardenBed, PlantWithSize } from './garden-bed'
import {
	isGridPlacement,
	type GridPlaceable,
	type GridPlacement,
} from '../grid/grid-placement'
import { isPlant, type Plant } from './plant'

export interface EdgeIndicator {
	id: string
	plantAId: string
	plantBId: string
	color: string
}
export interface Garden {
	id: string
	beds: GardenBed[]
	edgeIndicators: EdgeIndicator[]
}

export function movePlantBetweenBeds(
	garden: Garden,
	sourceBedId: string,
	targetBedId: string,
	placement: GridPlacement<GridPlaceable>,
	newX: number,
	newY: number,
): Garden {
	if (!isGridPlacement(placement, isPlant)) {
		throw new Error('Can only move grid placements between beds')
	}
	const sourceBed = garden.beds.find((b: GardenBed) => b.id === sourceBedId)
	const targetBed = garden.beds.find((b: GardenBed) => b.id === targetBedId)

	if (!sourceBed || !targetBed) {
		console.error(
			'[garden.ts] Source or target bed not found for movePlantToDifferentBed.',
		)
		return garden // Return original garden if beds not found
	}

	const updatedSourceBed = {
		...sourceBed,
		plantPlacements: sourceBed.plantPlacements.filter(
			(p: GridPlacement<PlantWithSize>) => p.id !== placement.id,
		),
	}

	const updatedTargetBed: GardenBed = {
		...targetBed,
		plantPlacements: [
			...targetBed.plantPlacements,
			{
				...placement,
				x: newX,
				y: newY,
				sourceZoneId: targetBedId,
				item: placement.item,
			} satisfies GridPlacement<Plant>,
		],
	}

	return {
		...garden,
		beds: garden.beds.map((b: GardenBed) => {
			if (b.id === sourceBedId) return updatedSourceBed
			if (b.id === targetBedId) return updatedTargetBed
			return b
		}),
	}
}

export function findBed(garden: Garden, bedId: string): GardenBed | undefined {
	return garden.beds.find((bed) => bed.id === bedId)
}

export function findPlantPlacement(
	bed: GardenBed,
	plantPlacementId: string,
): GridPlacement<PlantWithSize> | undefined {
	return bed.plantPlacements.find((pp) => pp.id === plantPlacementId)
}
