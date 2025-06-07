# Tooltip System Refactoring Summary

This document summarizes the work done to refactor the tooltip system, the challenges encountered, and the final state of the project.

## 1. Initial Goal

The project began with the goal of fixing a `TypeError` that occurred when rendering tooltips for new `Indicator` entities on the grid. The root cause was that the tooltip system was too tightly coupled to `GridPlaceable` items, which have a different data structure from `Indicator`s.

## 2. Phase 1: Generic Tooltip State

The first step was to make the tooltip system more generic and data-agnostic.

-   **`tooltipStore.ts`:** The store was modified to accept a generic `props` object instead of a specific `item` type.
-   **Component Updates:** `GlobalTooltipRenderer.svelte` and `TooltipWrapper.svelte` were updated to work with this new generic state.
-   **Call Site Updates:** The `onmouseenter` handlers in `Grid.svelte` (for `Indicator`s) and `GridPlacementTile.svelte` (for `GridPlaceable`s) were updated to use the new `showTooltip` function signature.

This successfully resolved the initial `TypeError`, allowing tooltips for both types of entities to be triggered without crashing.

## 3. Phase 2: Secondary Issues & Bug Fixes

The initial refactoring introduced several secondary issues that needed to be addressed.

### 3.1. Visual Regression: Accent Color

The `accentColor` on tooltips for `GridPlaceable` items disappeared. This was resolved by updating `TooltipWrapper.svelte` to inspect the generic `props`, use a type guard (`isGridPlaceable`), and apply the correct CSS variable if the props corresponded to a placeable item.

### 3.2. Positioning Errors & The "Measure-then-Position" Problem

This was the most significant and persistent challenge.

-   **Initial Problem:** Tooltips for `Indicator`s were positioned incorrectly (typically too high).
-   **Debugging:** A collaborative debugging session involving debug visuals (colored borders and dots) helped identify the core issue: a "chicken-and-egg" problem. To position the tooltip correctly, we needed its rendered dimensions, but we couldn't get those dimensions until it was in the DOM. The dynamic nature of the tooltip content made simple estimations unreliable.
-   **Proposed Solution:** The plan was to refactor `TooltipWrapper.svelte` to solve this. The component would first render invisibly, measure its actual `offsetHeight`, and then use that measurement to calculate and apply its final `top` and `left` position in a subsequent update.

## 4. Phase 3: Implementation Failures & Current State

This is where the project stalled.

### 4.1. `TooltipWrapper.svelte` Failures

Multiple attempts to implement the "measure-then-position" logic in `TooltipWrapper.svelte` using Svelte 5's `$effect` rune failed.
-   The complexity of coordinating the initial render, the DOM measurement, and the final positioning led to a series of linter errors and runtime crashes, including the infamous `TypeError: (0 , reaction.fn) is not a function`.
-   Different combinations of `$effect`s were attempted, but none resulted in a stable, working component. The interaction with Svelte 5's reactivity model for this specific DOM manipulation proved too complex to resolve.
-   **Current State:** The `TooltipWrapper.svelte` component is currently in a broken, non-functional state.

### 4.2. `Grid.svelte` Regression

In the process of trying to resolve the tooltip issues, a series of incorrect edits were made to `Grid.svelte`.
-   These edits broke the props contract for the component, leading to a fatal runtime error (`TypeError: $$props.grid.flatMap is not a function`) and a full application crash.
-   After several failed attempts to fix the cascading errors, `Grid.svelte` was reverted to its last known non-crashing state.
-   **Current State:** The `Grid.svelte` component is functional, but still has several linter warnings related to deprecated types and function signatures that were present before this refactoring effort began.

## 5. Conclusion

The tooltip system is currently in a broken state. While the initial crash was resolved, the subsequent effort to correctly position the tooltips has failed, leaving the `TooltipWrapper.svelte` component non-functional. The primary unresolved challenge is the correct implementation of the "measure-then-position" logic within the Svelte 5 reactivity paradigm. 