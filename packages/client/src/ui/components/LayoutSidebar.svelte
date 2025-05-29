<script lang="ts">
import { route } from '@mateothegreat/svelte5-router'
import logo from '../../assets/images/peashoot-sidebar-logo.png'
import LayoutSidebarMenu from './LayoutSidebarMenu.svelte'

const { ...rest }: Partial<Record<string, string>> = $props()
</script>

<style lang="scss">
.sidebar-logo {
	/* TODO: if a dark mode image is provided, this style might need adjustment or removal: dark:hidden */
	height: 40px;
	object-fit: contain;
}
#layout-sidebar {
	width: 300px !important;
	background: rgba(231, 240, 225);
}
</style>

<div
	id="layout-sidebar"
	class="flex h-100vh flex-col border-r border-green-900 {rest.class}"
>
	<a use:route class="flex min-h-16 items-center justify-center" href="/">
		<img alt="logo" class="sidebar-logo h-5" src={logo} />
	</a>
	<div class="relative min-h-0 grow overflow-y-auto">
		<div class="size-full">
			<LayoutSidebarMenu />
		</div>
	</div>
</div>
