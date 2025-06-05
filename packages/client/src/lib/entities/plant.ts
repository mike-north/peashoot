// Backward compatibility layer for legacy code
// This file re-exports PlantItem as Plant to maintain compatibility
import type { PlantItem } from '../item-types/plant-item'
import { isPlantItem, createPlantItem, getPlantProperties } from '../item-types/plant-item'

/**
 * @deprecated Use PlantItem instead. This is kept for backward compatibility.
 */
export type Plant = PlantItem

/**
 * @deprecated Use isPlantItem instead. This is kept for backward compatibility.
 */
export const isPlant = isPlantItem

/**
 * @deprecated Use createPlantItem instead. This is kept for backward compatibility.
 */
export const createPlant = createPlantItem

/**
 * @deprecated Use getPlantProperties instead. This is kept for backward compatibility.
 */
export const getPlantPropertiesLegacy = getPlantProperties 