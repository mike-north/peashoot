import { writable, type Writable } from 'svelte/store'
import { tick } from 'svelte'
import type { Component } from 'svelte'

interface TooltipRegistration<T extends object> {
	guard: (item: object) => item is T
	component: Component<{ item: T }>
}

export interface TooltipContext {
	id: string
	props: { item: object; [key: string]: unknown }
	target: HTMLElement | SVGElement
}

export interface TooltipInstance extends TooltipContext {
	component: Component<{ item: object }>
	position: { x: number; y: number }
}

type TooltipStore = Writable<TooltipInstance | null> & {
	show(
		target: HTMLElement | SVGElement,
		item: object,
		id: string,
		props?: Record<string, unknown>,
	): Promise<void>
	hide(id: string): void
	register<T extends object>(type: string, registration: TooltipRegistration<T>): void
}

function createTooltipStore(): TooltipStore {
	const { subscribe, set, update } = writable<TooltipInstance | null>(null)
	const registry = new Map<string, TooltipRegistration<object>>()

	return {
		subscribe,
		set,
		update,
		async show(
			target: HTMLElement | SVGElement,
			item: object,
			id: string,
			props: Record<string, object> = {},
		) {
			// Check all registered tooltip components for a match
			for (const [, registration] of registry) {
				if (registration.guard(item)) {
					// Hide any existing tooltip and wait for the DOM to update
					set(null)
					await tick()

					// Now it's safe to show the new tooltip
					set({
						id,
						props: { ...props, item },
						target,
						component: registration.component,
						position: { x: -9999, y: -9999 },
					})
					return
				}
			}

			// If we get here, no registration matched the item
			console.warn(`No tooltip registration found for item:`, item)
		},
		hide(id: string) {
			update((current) => {
				if (current?.id === id) {
					return null
				}
				return current
			})
		},
		register<T extends object>(type: string, registration: TooltipRegistration<T>) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			registry.set(type, registration as any as TooltipRegistration<object>)
		},
	}
}

export const tooltipStore = createTooltipStore()
