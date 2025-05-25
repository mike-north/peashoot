<script lang="ts">
  import type { PlantPlacement } from "../../lib/plant-placement";

  export let plantPlacement: PlantPlacement;
  export let x = 0; // SVG x position
  export let y = 0; // SVG y position
  export let width = 40; // SVG width (cellWidth * size)
  export let height = 40; // SVG height (cellHeight * size)
  export let tileX = 0; // grid x position
  export let tileY = 0; // grid y position
  export let gridSize = 1;

  // Color mapping for different plants
  const getPlantColor = (plantName: string) => {
    const colorMap: Record<string, string> = {
      'lettuce': 'bg-lettuce-green-50a',
      'tomato': 'bg-tomato-red-50a',
      'carrot': 'bg-carrot-orange-50a',
      'spinach': 'bg-spinach-green-50a',
      'cucumber': 'bg-cucumber-green-50a',
      'cherry': 'bg-poppy-red-50a',
      'pepper': 'bg-yellow-pepper-50a',
      'yellow pepper': 'bg-yellow-pepper-50a',
    };
    return colorMap[plantName.toLowerCase()] || 'bg-dew-gray-50a';
  };

  const colorClass = getPlantColor(plantPlacement.plantTile.name);
  const size = plantPlacement.plantTile.size || 1;
  const iconSize = Math.min(width, height) * 0.3;
  const iconX = x + width / 2;
  const iconY = y + height / 2;
  const borderColor = "#222"; // or use #5A3E36 for dark brown
  const borderWidth = 1;

  // Edge detection
  const isRightEdge = tileX + size === gridSize;
  const isBottomEdge = tileY === 0;
</script>

<svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
  <!-- Tile background -->
  <rect
    x={x}
    y={y}
    width={width}
    height={height}
    class={colorClass + ' plant-placement-tile__background'}
  />
  <!-- Plant icon -->
  <circle
    cx={iconX}
    cy={iconY}
    r={iconSize / 2}
    class={colorClass + ' plant-placement-tile__icon'}
    opacity="0.8"
  />
  <!-- Plant name text -->
  <text
    x={iconX}
    y={iconY + height / 4}
    text-anchor="middle"
    class="plant-placement-tile__name"
    font-size={Math.max(8, Math.min(width, height) / 6)}
  >
    {plantPlacement.plantTile.name}
  </text>
  <!-- Size indicator for multi-cell plants -->
  {#if size > 1}
    <text
      x={iconX}
      y={iconY - height / 4}
      text-anchor="middle"
      class="plant-placement-tile__size-indicator"
      font-size={Math.max(6, Math.min(width, height) / 8)}
    >
      {size}×{size}
    </text>
  {/if}
</svg>

<style lang="scss">
.plant-placement-tile {
  // &__background {
  //   /* colorClass is dynamic */
  // }
  &__icon {
    opacity: 0.8;
  }
  &__name {
    font-family: Arial, sans-serif;
    fill: #4B4E6D;
    opacity: 0.7;
  }
  &__size-indicator {
    font-family: Arial, sans-serif;
    fill: #4B4E6D;
    opacity: 0.5;
  }
  &__border {
    stroke: #222;
    stroke-width: 1;
    fill: none;
  }
}
</style>