import type { GardenBed } from "./garden-bed";
import type { PlantPlacement } from "./plant-placement";

export interface EdgeIndicator {
  id: string;
  plantAId: string;
  plantBId: string;
  color: string;
}
export interface Garden {
  id: string;
  beds: GardenBed[];
  edgeIndicators: EdgeIndicator[];
}

export function movePlantBetweenBeds(
  garden: Garden,
  sourceBedId: string,
  targetBedId: string,
  plant: PlantPlacement,
  newX: number,
  newY: number,
): Garden {
  const sourceBed = garden.beds.find((b: GardenBed) => b.id === sourceBedId);
  const targetBed = garden.beds.find((b: GardenBed) => b.id === targetBedId);

  if (!sourceBed || !targetBed) {
    console.error(
      "[garden.ts] Source or target bed not found for movePlantToDifferentBed.",
    );
    return garden; // Return original garden if beds not found
  }

  const updatedSourceBed = {
    ...sourceBed,
    plantPlacements: sourceBed.plantPlacements.filter(
      (p: PlantPlacement) => p.id !== plant.id,
    ),
  };

  const updatedTargetBed = {
    ...targetBed,
    plantPlacements: [
      ...targetBed.plantPlacements,
      { ...plant, x: newX, y: newY },
    ],
  };

  return {
    ...garden,
    beds: garden.beds.map((b: GardenBed) => {
      if (b.id === sourceBedId) return updatedSourceBed;
      if (b.id === targetBedId) return updatedTargetBed;
      return b;
    }),
  };
}
