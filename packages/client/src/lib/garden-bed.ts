import type { PlantPlacement } from "./plant-placement";


export interface GardenBed {
    id: string;
    width: number;
    height: number;
    waterLevel: number;
    sunLevel: number;
    plantPlacements: PlantPlacement[];
}