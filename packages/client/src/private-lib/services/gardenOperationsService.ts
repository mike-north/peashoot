import type { Garden } from '../garden'
import type { GardenBed } from '../garden-bed'
import type { Plant } from '../plant'
import type { PlantPlacement } from '../plant-placement'
import type { ExistingGardenItem } from '../../private-ui/state/gardenDragState'
import { movePlantBetweenBeds, findBed, findPlantPlacement } from '../garden'
import { updatePlantPositionInBed } from '../garden-bed'
import { existingGardenItemToPlantPlacement } from '../../private-ui/state/gardenDragState'

export class GardenOperationsService {
	movePlantInBed(
		garden: Garden,
		bedId: string,
		plantId: string,
		newX: number,
		newY: number,
	): Garden {
		const bed = garden.beds.find((b: GardenBed) => b.id === bedId)
		if (!bed) {
			console.error('[GardenOperationsService] Bed not found for movePlantInBed:', bedId)
			return garden
		}

		return {
			...garden,
			beds: garden.beds.map((b: GardenBed) =>
				b.id === bedId ? updatePlantPositionInBed(b, plantId, newX, newY) : b,
			),
		}
	}

	movePlantToDifferentBed(
		garden: Garden,
		sourceBedId: string,
		targetBedId: string,
		existingItem: ExistingGardenItem,
		newX: number,
		newY: number,
	): Garden {
		const plantPlacementArg = existingGardenItemToPlantPlacement(existingItem)
		return movePlantBetweenBeds(
			garden,
			sourceBedId,
			targetBedId,
			plantPlacementArg,
			newX,
			newY,
		)
	}

	addNewPlant(garden: Garden, bedId: string, item: Plant, x: number, y: number): Garden {
		const bed = garden.beds.find((b: GardenBed) => b.id === bedId)
		if (!bed) {
			console.error('[GardenOperationsService] Bed not found for addNewPlant:', bedId)
			return garden
		}

		const plantForPlacement: Plant = {
			...item,
		}
		const newPlantId = `${plantForPlacement.family}_${Date.now()}`

		const newPlacement: PlantPlacement = {
			id: newPlantId,
			x,
			y,
			plantId: plantForPlacement.id,
		}

		return {
			...garden,
			beds: garden.beds.map((b: GardenBed) =>
				b.id === bedId
					? { ...b, plantPlacements: [...b.plantPlacements, newPlacement] }
					: b,
			),
		}
	}

	deletePlant(garden: Garden, plantId: string, bedId: string): Garden {
		const bed = garden.beds.find((b: GardenBed) => b.id === bedId)
		if (!bed) {
			console.error('[GardenOperationsService] Bed not found for deletePlant:', bedId)
			return garden
		}

		return {
			...garden,
			beds: garden.beds.map((b: GardenBed) =>
				b.id === bedId
					? { ...b, plantPlacements: b.plantPlacements.filter((p) => p.id !== plantId) }
					: b,
			),
		}
	}

	findBed(garden: Garden, bedId: string): GardenBed | undefined {
		return findBed(garden, bedId)
	}

	findPlantPlacement(bed: GardenBed, plantId: string): PlantPlacement | undefined {
		return findPlantPlacement(bed, plantId)
	}
}
