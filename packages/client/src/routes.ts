import type { RouteConfig } from '@mateothegreat/svelte5-router'
import type { Component, Snippet } from 'svelte'
import Acorn from '~icons/ph/acorn-duotone'
import Farm from '~icons/ph/farm-duotone'
import Checklist from '~icons/ph/list-checks-duotone'
import CalculatorIcon from '~icons/ph/calculator-duotone'
import HomePage from './pages/HomePage.svelte'
import GardenPage from './pages/GardenPage.svelte'
import TasksPage from './pages/TasksPage.svelte'
import CalculatorsPage from './pages/CalculatorsPage.svelte'
import SeedCatalogPage from './pages/SeedCatalogPage.svelte'
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
		component: HomePage,
		label: 'Home',
		path: '/',
		hideInSidebar: true,
	},
	{
		component: GardenPage,
		label: 'Garden',
		path: '/garden',
		icon: Farm,
	},
	{
		component: SeedCatalogPage,
		label: 'Seed Catalog',
		path: '/seed-catalog',
		icon: Acorn,
	},
	{
		component: TasksPage,

		label: 'Tasks',
		path: '/tasks',
		icon: Checklist,
	},
	{
		component: CalculatorsPage,

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
