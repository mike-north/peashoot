<script lang="ts">
import type { Item } from '@peashoot/types'
import {
	PlantValidationRules,
	WorkspaceController,
} from '../lib/controllers/workspace-controller'
// This file now redirects to the new WorkspacePage with generic terminology
// The old garden-specific implementation is preserved but uses the new workspace system
import WorkspacePage from './WorkspacePage.svelte'

const { route } = $props()

const controller = new WorkspaceController<Item>({
	validationRules: [
		PlantValidationRules.checkBoundaries(),
		PlantValidationRules.noOverlaps(),
		PlantValidationRules.maxDensity(0.8),
		// Example of a specific plant restriction - can be customized as needed
		PlantValidationRules.restrictedPlantsByZone([
			{ plantType: 'shade-loving', zoneIds: ['full-sun-zone'] },
		]),
		// Example of incompatible plants - can be customized as needed
		PlantValidationRules.incompatiblePlants([
			{
				plant1: 'tomatoes',
				plant2: 'potatoes',
				reason: 'Tomatoes and potatoes should not be planted together (shared diseases)',
			},
		]),
	],
})
</script>

<!-- Garden page now uses the generic workspace system -->
<WorkspacePage route={route} controller={controller} />
