<script lang="ts">
	import logo from '../../assets/images/peashoot-sidebar-logo.png'
	import LayoutSidebarMenu, { type SidebarMenuProps } from './LayoutSidebarMenu.svelte'

	interface LayoutSidebarProps {
		menu: SidebarMenuProps
	}

	const props: LayoutSidebarProps = $props()
</script>

<div id="layout-sidebar">
	<a class="flex min-h-16 items-center justify-center" href="/">
		<img alt="logo" class="sidebar-logo h-5 dark:hidden" src={logo} />
	</a>
	<div class="relative min-h-0 grow">
		<div class="size-full">
			<LayoutSidebarMenu {...props.menu} />
		</div>
		<div
			class="from-base-100/60 pointer-events-none absolute start-0 end-0 bottom-0 h-7 bg-linear-to-t to-transparent"
		></div>
	</div>
</div>
<label for="layout-sidebar-toggle-trigger" id="layout-sidebar-backdrop"></label>

<style lang="scss">
	.sidebar-logo {
		height: 40px;
		object-fit: contain;
	}
	#layout-sidebar {
		background: rgba(var(--color-lettuce-green), 0.2);
	}
</style>
