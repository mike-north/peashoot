# Client Architecture

## Grid Placement System

The grid placement system provides a generic way to place items on integer-coordinate grids. This is separate from drag-and-drop concerns.

### Core Types

- **`GridPlacement<T>`**: Generic type representing any item placed on a grid

  - `id`: Unique identifier for this placement instance
  - `x`, `y`: Grid coordinates (0-based)
  - `size`: Size of the item on the grid (e.g., 2 means 2x2)
  - `data`: The actual item data

- **`GridPlaceable`**: Interface for items that can be placed on a grid

  - `id`: Item type identifier
  - `displayName`: Human-readable name
  - `size`: Default size on the grid
  - `presentation`: Visual presentation data

- **`GridItemPresentation`**: Visual data for rendering grid items
  - `iconPath`: Path to the icon
  - `accentColor`: Background color
  - `cssClass`: Optional CSS class

### Components

- **`GridPlacementTile`**: Generic Svelte component for rendering any `GridPlacement<T>` on a grid

  - Handles tooltip display
  - Supports pulsing animations
  - Size badges for multi-cell items

- **`PlantGridTile`**: Plant-specific wrapper around `GridPlacementTile`
  - Adapts plant data to the generic grid system
  - Provides plant-specific tooltip content

## Drag and Drop System

The drag-and-drop system is kept separate and only handles drag-specific concerns:

### Core Types

- **`DraggableItem`**: Base interface for draggable items

  - `id`: Item identifier
  - `size`: Optional size hint

- **`ExistingDraggableItem<T>`**: Represents an already-placed item that can be dragged
  - `id`: Placement instance ID
  - `itemData`: The underlying item
  - `sourceZoneId`: Where this item currently lives

### Grid-Specific Drag and Drop

The `grid-drag-state` module provides generic types for grid-based drag and drop:

- **`ExistingGridItem<T>`**: Extends `ExistingDraggableItem` with grid coordinates

  - Adds `x`, `y`, `size` for positioning
  - Generic over any `GridPlaceable` type

- **`GridZoneContext<T>`**: Context for grid-based drop zones

  - `width`, `height`: Grid dimensions
  - `placements`: Array of `GridPlacement<T>`

- **`GridDragState<T>`**: Specialized drag state for grid-based items
- **`GridValidationContext<T>`**: Validation context for grid operations

### Garden-Specific Integration

The garden application uses the generic grid drag state with Plant types:

- **`ExistingGardenItem`**: Type alias for `ExistingGridItem<Plant>`
- **`GardenZoneContext`**: Extends `GridZoneContext<Plant>` with garden-specific properties
  - Adds `waterLevel`, `sunLevel`
- **`GardenDragState`**: Type alias for `GridDragState<Plant>`

### Conversion Functions

Generic functions in `grid-drag-state`:

- `gridPlacementToExistingGridItem()`: Convert any grid placement to draggable
- `existingGridItemToGridPlacement()`: Convert draggable back to grid placement

Garden-specific functions remain in `gardenDragState`:

- `plantPlacementToExistingGardenItem()`: For backwards compatibility (deprecated)
- `existingGardenItemToPlantPlacement()`: For backwards compatibility (deprecated)

## Migration Path

Legacy `PlantPlacement` types are being phased out in favor of `GridPlacement<Plant>`:

1. `PlantPlacement` is marked as deprecated
2. Conversion functions are provided for backwards compatibility
3. New code should use `GridPlacement<Plant>` directly

## Benefits of This Architecture

1. **Separation of Concerns**: Grid placement logic is independent of drag-and-drop
2. **Reusability**: The grid system can be used for any items, not just plants
3. **Type Safety**: Generic types ensure compile-time safety
4. **Extensibility**: Easy to add new item types to the grid system
5. **Generic Infrastructure**: The grid drag state can be reused for any grid-based application
