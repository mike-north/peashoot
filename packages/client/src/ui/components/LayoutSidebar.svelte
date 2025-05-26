<script lang="ts">
	import { route } from '@mateothegreat/svelte5-router'
	import logo from '../../assets/images/peashoot-sidebar-logo.png'
	import LayoutSidebarMenu from './LayoutSidebarMenu.svelte'

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface LayoutSidebarProps {}

	const _props: LayoutSidebarProps = $props()
</script>

<div id="layout-sidebar" class="w-64">
	<a use:route class="flex min-h-16 items-center justify-center" href="/">
		<img alt="logo" class="sidebar-logo h-5 dark:hidden" src={logo} />
	</a>
	<div class="relative min-h-0 grow">
		<div class="size-full">
			<LayoutSidebarMenu />
		</div>
	</div>
</div>
<label for="layout-sidebar-toggle-trigger" id="layout-sidebar-backdrop"></label>

<style lang="scss">
	.sidebar-logo {
		height: 40px;
		object-fit: contain;
	}
	#layout-sidebar {
		background: rgba(231, 240, 225);
	}
</style>
