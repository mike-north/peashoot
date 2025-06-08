import { tooltipStore } from './store'
import type { Action } from 'svelte/action'

export const tooltip: Action<HTMLElement | SVGElement, { item: object } | undefined> = (
	node,
	params,
) => {
	if (!params) {
		return {
			destroy() {
				//
			},
		}
	}

	const id = Math.random().toString(36).substring(2, 9)

	const show = () => {
		if (!params) return
		tooltipStore.show(node, params.item, id).catch((err: unknown) => {
			console.error(err)
		})
	}

	const hide = () => {
		tooltipStore.hide(id)
	}

	node.addEventListener('mouseenter', show)
	node.addEventListener('mouseleave', hide)
	node.addEventListener('focus', show)
	node.addEventListener('blur', hide)

	return {
		update(newParams) {
			if (!newParams) {
				hide()
				params = undefined
				return
			}
			params = newParams
		},
		destroy() {
			node.removeEventListener('mouseenter', show)
			node.removeEventListener('mouseleave', hide)
			node.removeEventListener('focus', show)
			node.removeEventListener('blur', hide)
			hide()
		},
	}
}
