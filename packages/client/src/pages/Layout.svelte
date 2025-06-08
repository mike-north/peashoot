<script lang="ts">
import { Router } from '@mateothegreat/svelte5-router'
import { routes } from '../routes'

import LayoutSidebar from '../components/LayoutSidebar.svelte'
import NotificationToast from '../components/NotificationToast.svelte'
import TooltipContainer from '../lib/tooltips/TooltipContainer.svelte'
import { tooltipStore } from '../lib/tooltips/store'
import ItemTooltipContent from '../lib/ItemTooltipContent.svelte'
import { isGridPlaceable, type GridPlaceable } from '../private/grid/grid-placement'
import {
	isIndicatorVisual,
	type IndicatorVisual,
} from '../private/grid/zone-layout-calculator'
import type { Component } from 'svelte'
import IndicatorTooltipContent from '../lib/IndicatorTooltipContent.svelte'

tooltipStore.register('indicatorVisual', {
	guard: isIndicatorVisual,
	component: IndicatorTooltipContent as Component<{ item: IndicatorVisual }>,
})

tooltipStore.register('item', {
	guard: isGridPlaceable,
	component: ItemTooltipContent as Component<{ item: GridPlaceable }>,
})
</script>

<div class="size-full">
	<div class="flex flex-row h-full">
		<LayoutSidebar class="flex-none" />

		<div class="grow h-full min-w-0 grid-cols-9 overflow-scroll p-4">
			<Router routes={routes} />
		</div>
	</div>

	<!-- Global notification toast -->
	<NotificationToast />

	<!-- Global tooltip renderer -->
	<TooltipContainer />
</div>
