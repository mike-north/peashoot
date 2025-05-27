<script lang="ts">
import { Router } from '@mateothegreat/svelte5-router'
import { routes } from '../../routes'

import LayoutSidebar from '../components/LayoutSidebar.svelte'
</script>

<div class="size-full">
	<div class="flex h-full">
		<LayoutSidebar />

		<div class="flex h-full min-w-0 grow flex-col overflow-auto">
			<div id="layout-content" class="grid flex-1 p-6">
				<Router routes={routes} />
			</div>
		</div>
	</div>
</div>
