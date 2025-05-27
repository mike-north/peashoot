import type { RouteConfig } from '@mateothegreat/svelte5-router'
import type { Component, Snippet } from 'svelte'
import Acorn from '~icons/ph/acorn-duotone'
import Farm from '~icons/ph/farm-duotone'
import Checklist from '~icons/ph/list-checks-duotone'
import CalculatorIcon from '~icons/ph/calculator-duotone'
import Home from './ui/pages/Home.svelte'
import Garden from './ui/pages/Garden.svelte'
import Tasks from './ui/pages/Tasks.svelte'
import Calculators from './ui/pages/Calculators.svelte'
import SeedCatalog from './ui/pages/SeedCatalog.svelte'
import type { RouteResult } from '@mateothegreat/svelte5-router/route.svelte'

export interface PeashootRoute {
	component?:
		| Component<{ route: RouteResult }>
		| Snippet
		| (() => Promise<Component<{ route: RouteResult }> | Snippet>)
	label: string
	icon?: Component<Record<string, unknown>>
	path: string
	hideInSidebar?: boolean
}

export interface PeashootRouteInfo {
	forRouter: RouteConfig
	label: string
	icon?: Component<Record<string, unknown>>
	path: string
}

export const routeInfos: PeashootRoute[] = [
	{
		component: Home,
		label: 'Home',
		path: '/',
		hideInSidebar: true,
	},
	{
		component: Garden,
		label: 'Garden',
		path: '/garden',
		icon: Farm,
	},
	{
		component: SeedCatalog,
		label: 'Seed Catalog',
		path: '/seed-catalog',
		icon: Acorn,
	},
	{
		component: Tasks,

		label: 'Tasks',
		path: '/tasks',
		icon: Checklist,
	},
	{
		component: Calculators,

		label: 'Calculators',
		path: '/calculators',
		icon: CalculatorIcon,
	},
]

export const routes: RouteConfig[] = routeInfos.map((routeInfo) => ({
	path: routeInfo.path,
	component: routeInfo.component,
	props: {
		routeInfo,
	},
}))

export const defaultRouteConfig: RouteConfig = {
	active: {
		class: ['active-route'],
	},
}
