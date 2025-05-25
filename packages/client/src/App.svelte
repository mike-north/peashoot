<script lang="ts">
  import Garden from "./ui/components/GardenView.svelte";
  import SeedPacket from "./ui/components/SeedPacket.svelte";
</script>

<main>
  <Garden
    garden={{
      id: "garden_0",
      edgeIndicators: [
        {
          id: "edge_indicator_0",
          plantAId: "lettuce_1",
          plantBId: "tomato_1",
          color: "red",
        },
        {
          id: "edge_indicator_1",
          plantAId: "cherry_tomato_1",
          plantBId: "tomato_2",
          color: "red",
        },
      ],
      beds: [
        {
          id: "bed_0",
          width: 1,
          height: 1,
          waterLevel: 0,
          sunLevel: 0,
          plantPlacements: [
            {
              id: "placeholder_0",
              x: 0,
              y: 0,
              plantTile: {
                id: "lettuce_0",
                name: "lettuce",
                icon: "🌱",
                size: 1,
              },
            },
          ],
        },
        {
          id: "bed_1",
          width: 6,
          height: 2,
          waterLevel: 2,
          sunLevel: 4,
          plantPlacements: [
            {
              id: "tomato_1",
              x: 0,
              y: 0,
              plantTile: { id: "tomato", name: "tomato", icon: "🍅", size: 2 },
            },
            {
              id: "lettuce_1",
              x: 2,
              y: 0,
              plantTile: {
                id: "lettuce",
                name: "lettuce",
                icon: "🥬",
                size: 1,
              },
            },
          ],
        },
        {
          id: "bed_2",
          width: 7,
          height: 4,
          waterLevel: 3,
          sunLevel: 3,
          plantPlacements: [
            {
              id: "cherry_tomato_1",
              x: 2,
              y: 1,
              plantTile: { id: "cherry", name: "cherry", icon: "🍒", size: 3 },
            },
            {
              id: "tomato_2",
              x: 0,
              y: 0,
              plantTile: { id: "tomato", name: "tomato", icon: "🍅", size: 2 },
            },
            {
              id: "lettuce_2",
              x: 2,
              y: 0,
              plantTile: {
                id: "lettuce",
                name: "lettuce",
                icon: "🥬",
                size: 1,
              },
            },
          ],
        },
      ],
    }}
  />
  <SeedPacket />
</main>
