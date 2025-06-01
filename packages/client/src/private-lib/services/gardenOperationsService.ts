import type { Garden } from '../../lib/garden'
import type { GardenBed, PlantWithSize } from '../../lib/garden-bed'
import type { Plant } from '../../lib/plant'
import type { ExistingGardenItem } from '../../private-ui/state/gardenDragState'
import { movePlantBetweenBeds, findBed, findPlantPlacement } from '../../lib/garden'
import { updatePlantPositionInBed } from '../../lib/garden-bed'
import type { GridPlacement } from '../../grid/grid-placement'

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
		existingItem: ExistingGardenItem<PlantWithSize>,
		newX: number,
		newY: number,
	): Garden {
		// Use the existing item directly since ExistingGardenItem is now GridPlacement
		return movePlantBetweenBeds(
			garden,
			sourceBedId,
			targetBedId,
			existingItem,
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
		const plantWithSize = {
			...plantForPlacement,
			size: plantForPlacement.plantingDistanceInFeet,
		}

		const newPlacement: GridPlacement<PlantWithSize> = {
			id: newPlantId,
			x,
			y,
			size: plantForPlacement.plantingDistanceInFeet,
			item: plantWithSize,
			sourceZoneId: bedId,
		}

		return {
			...garden,
			beds: garden.beds.map((b: GardenBed) =>
				b.id === bedId ? { ...b, placements: [...b.placements, newPlacement] } : b,
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
					? { ...b, placements: b.placements.filter((p) => p.id !== plantId) }
					: b,
			),
		}
	}

	findBed(garden: Garden, bedId: string): GardenBed | undefined {
		return findBed(garden, bedId)
	}

	findPlantPlacement(
		bed: GardenBed,
		plantId: string,
	): GridPlacement<PlantWithSize> | undefined {
		return findPlantPlacement(bed, plantId)
	}
}
