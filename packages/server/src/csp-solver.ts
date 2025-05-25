/* eslint-disable */
// planting-csp-scaffold.ts

import { CSP, min_conflicts } from "csps";

// Define the grid (e.g., 3x3 cells)
const gridSize = 3;
const cells = [];
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    cells.push(`${row},${col}`);
  }
}

// Define a small set of plants with spacing and light needs
const plants = {
  arugula: { minSpacing: 1, sun: "full" },
  lettuce: { minSpacing: 1, sun: "partial" },
  tomato: { minSpacing: 2, sun: "full" },
};

// Assign each cell a domain (possible plants that could go there)
const domains: Record<string, string[]> = {};
cells.forEach((cell) => {
  domains[cell] = Object.keys(plants);
});

// Define neighbors (adjacent cells)
function getNeighbors(cell: string): string[] {
  const [row, col] = cell.split(",").map(Number);
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        neighbors.push(`${r},${c}`);
      }
    }
  }
  return neighbors;
}

const neighbors: Record<string, string[]> = {};
cells.forEach((cell) => {
  neighbors[cell] = getNeighbors(cell);
});

// Define a simple constraint: no same plant type in adjacent cells if minSpacing > 1
const constraints = (cell1: string, plant1: string, cell2: string, plant2: string) => {
  if (plant1 !== plant2) return true;
  const spacing = plants[plant1].minSpacing;
  if (spacing > 1) return false;
  return true;
};

// Create the CSP and solve
const csp = new CSP(cells, domains, neighbors, constraints);
const solution = min_conflicts(csp, 1000);

console.log("Plant placement solution:");
console.table(solution);
