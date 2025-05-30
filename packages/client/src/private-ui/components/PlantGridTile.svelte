<script
	lang="ts"
	generics="T extends { id: string; displayName: string; presentation: { iconPath: string; accentColor: { r: number; g: number; b: number; a?: number }; size: number } }"
>
import GridPlacementTile from './GridPlacementTile.svelte'
import type { GridPlacement } from '../../private-lib/grid-placement'
import { tileVisualPresentationToGridPresentation } from '../../private-lib/plant'

interface Props<
	T extends {
		id: string
		displayName: string
		presentation: {
			iconPath: string
			accentColor: { r: number; g: number; b: number; a?: number }
			size: number
		}
	},
> {
	placement: GridPlacement<T>
	sizePx: number
	isPulsingSource?: boolean
	showSizeBadge?: boolean
	presentationAdapter?: (presentation: T['presentation']) => {
		iconPath: string
		accentColor: { r: number; g: number; b: number; a?: number }
		size: number
	}
}

let {
	placement,
	sizePx,
	isPulsingSource = false,
	showSizeBadge = false,
	presentationAdapter = tileVisualPresentationToGridPresentation as (
		presentation: T['presentation'],
	) => {
		iconPath: string
		accentColor: { r: number; g: number; b: number; a?: number }
		size: number
	},
}: Props<T> = $props()

// Transform data to be compatible with GridPlacementTile's generic constraints
const transformedData = $derived(() => {
	const pres = presentationAdapter(placement.data.presentation)
	return {
		...placement.data,
		presentation: pres,
		size: pres.size,
	}
})

const transformedPlacement = $derived(() => {
	const data = transformedData()
	return {
		...placement,
		data,
		size: data.size,
	}
})

// Plant-specific tooltip props
const tooltipProps = $derived({})
</script>

<GridPlacementTile
	placement={transformedPlacement()}
	sizePx={sizePx}
	isPulsingSource={isPulsingSource}
	showSizeBadge={showSizeBadge}
	tooltipProps={tooltipProps}
/>
