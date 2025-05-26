import type { RouteConfig } from '@mateothegreat/svelte5-router'
import type { Component } from 'svelte'
import Acorn from '~icons/ph/acorn-duotone'
import Farm from '~icons/ph/farm-duotone'
import Checklist from '~icons/ph/list-checks-duotone'
import WeatherIcon from '~icons/ph/cloud-sun-duotone'
import Home from './ui/pages/Home.svelte'
import Garden from './ui/pages/Garden.svelte'
import Tasks from './ui/pages/Tasks.svelte'
import Weather from './ui/pages/Weather.svelte'
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
	{
		forRouter: {
			path: '/tasks',
			component: Tasks,
		},
		label: 'Tasks',
		path: '/tasks',
		icon: Checklist,
	},
	{
		forRouter: {
			path: '/weather',
			component: Weather,
		},
		label: 'Weather',
		path: '/weather',
		icon: WeatherIcon,
	},
]

export const defaultRouteConfig: RouteConfig = {
	active: {
		class: ['active-route'],
	},
}
