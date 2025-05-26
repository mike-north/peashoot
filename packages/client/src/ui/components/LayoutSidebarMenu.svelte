<script lang="ts">
	export interface SidebarNavGroup {
		label: string
		items: SidebarNavItem[]
	}

	export interface SidebarNavItem {
		label: string
		href: string
	}

	export interface SidebarMenuProps {
		topItems?: SidebarNavItem[]
		groups?: SidebarNavGroup[]
	}

	const { topItems = [], groups = [] }: SidebarMenuProps = $props()
</script>

<div id="sidebar-menu">
	{#each topItems as item (item.href)}
		<div class="collapse">
			<!-- TODO: Add icon -->
			<a class=" top-level-item grow" href={item.href}>{item.label}</a>
		</div>
	{/each}

	{#each groups as group (group.label)}
		<div class="group collapse">
			<input
				aria-label="Sidemenu item trigger"
				class="peer"
				type="checkbox"
				name="sidebar-menu-parent-item"
			/>
			<div class="collapse-title">
				<!-- TODO: Add icon -->
				<span class="grow">{group.label}</span>
			</div>
			<div class="collapse-content">
				{#each group.items as item (item.href)}
					<a class="sidebar-menu-item" href={item.href}>{item.label}</a>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	#sidebar-menu {
		.top-level-item {
			min-height: calc(var(--spacing) * 8);
			align-items: center;
			gap: calc(var(--spacing) * 2);
			border-radius: var(--radius-box);
			padding-inline: calc(var(--spacing) * 3);
			padding-block: calc(var(--spacing) * 1.5);
			font-size: var(--text-sm);
			line-height: var(--tw-leading, var(--text-sm--line-height));
			display: flex;
			color: rgba(var(--color-jalapeno-green), 1);
		}
		.collapse-title {
			color: rgba(var(--color-spinach-green), 1);
			font-weight: 900;
		}
		.sidebar-menu-item {
			color: rgba(var(--color-jalapeno-green), 1);
		}
	}
</style>
