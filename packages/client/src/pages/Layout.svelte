<script lang="ts">
import { Router } from '@mateothegreat/svelte5-router'
import { routes } from '../routes'

import LayoutSidebar from '../private-ui/components/LayoutSidebar.svelte'
import NotificationToast from '../private-ui/components/NotificationToast.svelte'
import GlobalTooltipRenderer from '../private/tooltips/GlobalTooltipRenderer.svelte'
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
	<GlobalTooltipRenderer />
</div>
