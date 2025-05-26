import { describe, it, expect } from "vitest";
import {
  updatePlantPositionInBed,
  type GardenBed,
} from "../src/lib/garden-bed.js";
import type { PlantPlacement } from "../src/lib/plant-placement.js";
import type { Plant } from "../src/lib/plant.js";

const mockPlant: Plant = {
  id: "plant1",
  name: "Tomato",
  icon: "tomato.png",
  size: 1,
};

const mockPlacement: PlantPlacement = {
  plantTile: mockPlant,
  x: 1,
  y: 2,
  id: "placement1",
};

const mockBed: GardenBed = {
  id: "bed1",
  width: 4,
  height: 4,
  waterLevel: 5,
  sunLevel: 7,
  plantPlacements: [mockPlacement],
};

describe("updatePlantPositionInBed", () => {
  it("updates the position of the specified plant", () => {
    const updated: GardenBed = updatePlantPositionInBed(
      mockBed,
      "placement1",
      3,
      4,
    );
    const [plant1] = updated.plantPlacements as PlantPlacement[];
    expect(plant1.x).toBe(3);
    expect(plant1.y).toBe(4);
    // Should not mutate the original
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockBed.plantPlacements[0].x).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockBed.plantPlacements[0].y).toBe(2);
  });

  it("does not update if plantId does not match", () => {
    const updated: GardenBed = updatePlantPositionInBed(
      mockBed,
      "nonexistent",
      5,
      6,
    );
    const [plant1] = updated.plantPlacements as PlantPlacement[];
    expect(plant1.x).toBe(1);
    expect(plant1.y).toBe(2);
    // Should not mutate the original
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockBed.plantPlacements[0].x).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockBed.plantPlacements[0].y).toBe(2);
  });

  it("returns a new GardenBed object", () => {
    const updated: GardenBed = updatePlantPositionInBed(
      mockBed,
      "placement1",
      3,
      4,
    );
    expect(updated).not.toBe(mockBed);
  });
});
