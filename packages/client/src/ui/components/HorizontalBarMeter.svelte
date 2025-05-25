<script lang="ts">
  interface HorizontalBarMeterProps {
    id: string;
    value: number;
    max: number;
    label: string;
    filledColor: string;
    emptyColor: string;
    borderColor: string;
    labelColor: string;
  }

  const {
    id,
    value,
    max,
    label,
    filledColor = "#3498db",
    emptyColor = "#3498db22",
    borderColor = "#3498db",
    labelColor = "#3498db",
  }: HorizontalBarMeterProps = $props();
</script>

<div class="horizontal-bar-meter">
  <svg
    class="horizontal-bar-meter__graph"
    width={2 + max * 7.2 + 2}
    height="10"
  >
    {#each Array.from<unknown>({ length: max }) as _, i (`${id}-cell-${i}`)}
      <rect
        x={2 + i * 7.2}
        y={1}
        width={6}
        height={6}
        rx={1.5}
        fill={i < value ? filledColor : emptyColor}
        stroke={borderColor}
        stroke-width="0.8"
      />
    {/each}
  </svg>
  <span class="horizontal-bar-meter__label" style="color: {labelColor};"
    >{label}</span
  >
</div>

<style lang="scss">
  .horizontal-bar-meter {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;

    &__graph {
      display: block;
      align-self: center;
    }

    &__label {
      line-height: 1rem;
      font-size: 0.5rem;
      font-weight: 600;
      vertical-align: middle;
      margin-top: -2px;
    }
  }
</style>
