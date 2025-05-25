import type { GardenBed } from "./garden-bed";

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
