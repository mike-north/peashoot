<script lang="ts">
import { route } from '@mateothegreat/svelte5-router'
import { defaultRouteConfig, routeInfos } from '../routes'

const topItems = routeInfos
	.filter((r) => !r.hideInSidebar)
	.map((r) => ({
		label: r.label,
		href: r.path,
		icon: r.icon,
	}))
</script>

<style lang="scss">
#sidebar-menu {
	:global(.top-level-item.active-route) {
		border: 1px solid black;
		background-color: var(--color-amber-100);
		border-color: var(--color-stone-700);
		color: var(--color-stone-700);
		font-weight: bold;
		&:hover {
			background-color: var(--color-amber-100) !important;
			--tw-bg-opacity: 1 !important; /* Ensure full background opacity */
			color: var(--color-stone-700) !important;
			--tw-text-opacity: 1 !important; /* Ensure full text opacity */
			font-weight: bold;
			border: 1px solid var(--color-stone-700) !important;
			background-image: none !important; /* Keep this to override DaisyUI default hover image/gradient */
			/* Ensure border-radius matches default if not already covered by .btn or other styles */
		}
	}
	.top-level-item {
		border: 1px solid transparent;
		color: var(--color-green-800);
		min-height: calc(var(--spacing) * 8);
		align-items: center;
		gap: calc(var(--spacing) * 2);
		border-radius: var(--radius-box);
		padding-inline: calc(var(--spacing) * 3);
		padding-block: calc(var(--spacing) * 1.5);
		font-size: var(--text-sm);
		line-height: var(--tw-leading, var(--text-sm--line-height));
		display: flex;
		// Default text color - you might want to adjust this
	}
}
</style>

<div id="sidebar-menu" class="p-2">
	{#each topItems as item (item.href)}
		<div class="collapse mb-1">
			<!-- TODO: Add icon -->
			<a class="top-level-item grow" href={item.href} use:route={defaultRouteConfig}>
				{#if item.icon}
					<item.icon class="size-4" />
				{/if}
				{item.label}
			</a>
		</div>
	{/each}

	<!-- {#each groups as group (group.label)}
		<div class="group collapse mb-1">
			<input
				aria-label="Sidemenu item trigger"
				class="peer"
				type="checkbox"
				name="sidebar-menu-parent-item"
			/>
			<div class="collapse-title" use:route={defaultRouteConfig}>
				<span class="grow">{group.label}</span>
			</div>
			<div class="collapse-content">
				{#each group.items as item (item.href)}
					<a class="sidebar-menu-item" href={item.href} use:route={defaultRouteConfig}
						>{item.label}</a
					>
				{/each}
			</div>
		</div>
	{/each} -->
</div>
