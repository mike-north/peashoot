import type { RouteConfig } from '@mateothegreat/svelte5-router'
import type { Component } from 'svelte'
import Home from './ui/pages/Home.svelte'
import Acorn from '~icons/ph/acorn-duotone'
import Farm from '~icons/ph/farm-duotone'
import Garden from './ui/pages/Garden.svelte'
import SeedCatalog from './ui/pages/SeedCatalog.svelte'

export interface PeashootRouteInfo {
	forRouter: RouteConfig
	label: string
	icon?: Component<Record<string, unknown>>
	path: string
	hideInSidebar?: boolean
}

export const routes: PeashootRouteInfo[] = [
	{
		forRouter: {
			component: Home,
		},
		label: 'Home',
		path: '/',
		hideInSidebar: true,
	},
	{
		forRouter: {
			path: '/garden',
			component: Garden,
		},
		label: 'Garden',
		path: '/garden',
		icon: Farm,
	},
	{
		forRouter: {
			path: '/seed-catalog',
			component: SeedCatalog,
		},
		label: 'Seed Catalog',
		path: '/seed-catalog',
		icon: Acorn,
	},
]

export const defaultRouteConfig: RouteConfig = {
	active: {
		class: ['active-route'],
	},
}
