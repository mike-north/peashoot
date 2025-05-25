<script lang="ts">
  import type { PlantPlacement } from "../../lib/plant-placement";
  import { dragState } from "../state/dragState";
  import type { GardenBed } from "../../lib/garden-bed";
  import { onDestroy } from "svelte";
  import type { Garden } from "../../lib/garden";
  import GardenBedView from "./GardenBedView.svelte";

  interface GardenProps {
    garden: Garden;
  }

  let { garden }: GardenProps = $props();
  let { beds, edgeIndicators } = $derived(garden);
  let gardenRef: HTMLDivElement | null = null;

  function handleTileMouseDown(
    plant: PlantPlacement,
    bedId: string,
    event: MouseEvent
  ) {
    // Set dragState with draggedPlant, sourceBedId, and initial mouse position
    dragState.set({
      draggedPlant: plant,
      draggedTileSize: plant.plantTile.size || 1,
      dragOffset: { x: event.clientX, y: event.clientY },
      dragPosition: { x: event.clientX, y: event.clientY },
      highlightedCell: null,
      sourceBedId: bedId,
      targetBedId: bedId,
    });
    window.addEventListener("mousemove", onGardenMouseMove);
    window.addEventListener("mouseup", onGardenMouseUp);
  }

  function onGardenMouseMove(event: MouseEvent) {
    // For each bed, check if mouse is over its SVG
    for (const bed of beds) {
      const svg = document.querySelector(`[data-bed-id='${bed.id}'] svg`);
      if (!svg) continue;
      const rect = svg.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        // Mouse is over this bed
        // Calculate cell coordinates
        // We'll need to get layout info from the bed (assume cell size 40 for now)
        const cellSize = 40; // TODO: get from bed or layout
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((rect.bottom - event.clientY) / cellSize);
        dragState.update((s) => ({
          ...s,
          targetBedId: bed.id,
          dragPosition: { x: event.clientX, y: event.clientY },
          highlightedCell: { x, y },
        }));
        return;
      }
    }
    // If not over any bed, clear highlight
    dragState.update((s) => ({
      ...s,
      targetBedId: null,
      highlightedCell: null,
    }));
  }

  function isValidDrop(
    targetBed: GardenBed,
    draggedPlant: PlantPlacement,
    x: number,
    y: number
  ): boolean {
    const size = draggedPlant.plantTile.size || 1;
    // Bounds check
    if (
      x < 0 ||
      y < 0 ||
      x + size > targetBed.width ||
      y + size > targetBed.height
    ) {
      return false;
    }
    // Overlap check
    for (const p of targetBed.plantPlacements) {
      if (p.id === draggedPlant.id) continue; // skip self
      const pSize = p.plantTile.size || 1;
      for (let dx = 0; dx < size; dx++) {
        for (let dy = 0; dy < size; dy++) {
          const cellX = x + dx;
          const cellY = y + dy;
          for (let pdx = 0; pdx < pSize; pdx++) {
            for (let pdy = 0; pdy < pSize; pdy++) {
              if (cellX === p.x + pdx && cellY === p.y + pdy) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  function onGardenMouseUp(event: MouseEvent) {
    const state = $dragState;
    if (state.draggedPlant && state.targetBedId && state.highlightedCell) {
      const draggedPlant = state.draggedPlant;
      const highlightedCell = state.highlightedCell;
      const targetBed = garden.beds.find((b) => b.id === state.targetBedId);
      if (!targetBed) return cleanupDrag();
      // Check bounds and overlap
      if (
        !isValidDrop(
          targetBed,
          draggedPlant,
          highlightedCell.x,
          highlightedCell.y
        )
      ) {
        cleanupDrag();
        return;
      }
      if (state.sourceBedId === state.targetBedId) {
        // Move within the same bed
        beds = beds.map((b) => {
          if (b.id !== state.sourceBedId) return b;
          return {
            ...b,
            plantPlacements: b.plantPlacements.map((p) =>
              p.id === draggedPlant.id
                ? { ...p, x: highlightedCell.x, y: highlightedCell.y }
                : p
            ),
          };
        });
      } else {
        // Move to a different bed
        beds = beds.map((b) => {
          if (b.id === state.sourceBedId) {
            return {
              ...b,
              plantPlacements: b.plantPlacements.filter(
                (p) => p.id !== draggedPlant.id
              ),
            };
          }
          if (b.id === state.targetBedId) {
            return {
              ...b,
              plantPlacements: [
                ...b.plantPlacements,
                {
                  ...draggedPlant,
                  x: highlightedCell.x,
                  y: highlightedCell.y,
                  plantTile: draggedPlant.plantTile,
                  id: draggedPlant.id,
                },
              ],
            };
          }
          return b;
        });
      }
    }
    cleanupDrag();
  }

  function cleanupDrag() {
    dragState.set({
      draggedPlant: null,
      draggedTileSize: 1,
      dragOffset: null,
      dragPosition: null,
      highlightedCell: null,
      sourceBedId: null,
      targetBedId: null,
    });
    window.removeEventListener("mousemove", onGardenMouseMove);
    window.removeEventListener("mouseup", onGardenMouseUp);
  }

  onDestroy(() => {
    window.removeEventListener("mousemove", onGardenMouseMove);
    window.removeEventListener("mouseup", onGardenMouseUp);
  });

  function generateSetPlantPlacementsForBed(bed: GardenBed) {
    return (plants: PlantPlacement[]) => {
      // For each plant in the new array, update or add it
      const updatedPlacements = [
        ...plants.map((updated) => {
          const existing = bed.plantPlacements.find((p) => p.id === updated.id);
          return existing
            ? { ...existing, x: updated.x, y: updated.y }
            : updated;
        }),
      ];
      beds = beds.map((b) =>
        b.id === bed.id ? { ...b, plantPlacements: updatedPlacements } : b
      );
    };
  }
</script>

<div class="garden" bind:this={gardenRef}>
  {#each beds as bed}
    <GardenBedView
      {bed}
      setPlantPlacements={generateSetPlantPlacementsForBed(bed)}
      onTileMouseDownFromParent={handleTileMouseDown}
      {edgeIndicators}
    />
  {/each}
</div>

<style>
  
</style>
