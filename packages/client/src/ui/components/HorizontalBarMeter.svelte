<script lang="ts">
  export let value: number = 0;
  export let max: number = 5;
  export let filledColor: string = '#3498db';
  export let emptyColor: string = '#3498db22';
  export let borderColor: string = '#3498db';
  export let label: string = '';
  export let labelColor: string = '#3498db';
</script>

<div class="horizontal-bar-meter">
  <svg class="horizontal-bar-meter__graph" width={2 + max * 7.2 + 2} height="10">
    {#each Array.from({ length: max }) as _, i}
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
  <span class="horizontal-bar-meter__label" style="color: {labelColor};">{label}</span>
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