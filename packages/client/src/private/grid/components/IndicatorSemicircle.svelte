<script lang="ts">
export interface Props {
	centerX: number
	centerY: number
	radius: number
	color: string
	direction: 'top' | 'bottom' | 'left' | 'right'
	isQuadrant?: boolean
}

const { centerX, centerY, radius, color, direction, isQuadrant = false }: Props = $props()

function getPathData(
	cx: number,
	cy: number,
	r: number,
	dir: 'top' | 'bottom' | 'left' | 'right',
	quadrant: boolean,
) {
	const rad = Math.PI / 180
	const largeArc = quadrant ? 0 : 1

	const semiCircleAngles = {
		top: { start: 180, end: 360, sweep: 1 },
		bottom: { start: 0, end: 180, sweep: 1 },
		left: { start: 90, end: 270, sweep: 1 },
		right: { start: -90, end: 90, sweep: 1 },
	}

	const quadrantAngles = {
		top: { start: 270, end: 360, sweep: 1 }, // Top-Right Quadrant
		right: { start: 0, end: 90, sweep: 1 }, // Bottom-Right Quadrant
		bottom: { start: 90, end: 180, sweep: 1 }, // Bottom-Left Quadrant
		left: { start: 180, end: 270, sweep: 1 }, // Top-Left Quadrant
	}

	const angles = quadrant ? quadrantAngles : semiCircleAngles

	const { start, end, sweep } = angles[dir]

	const x1 = cx + r * Math.cos(rad * start)
	const y1 = cy + r * Math.sin(rad * start)
	const x2 = cx + r * Math.cos(rad * end)
	const y2 = cy + r * Math.sin(rad * end)

	const filled = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`
	const outline = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`

	return { filled, outline }
}

let pathData = $derived(getPathData(centerX, centerY, radius, direction, isQuadrant))
</script>

<path d={pathData.filled} fill={color} stroke="none" />
<path
	d={pathData.outline}
	fill="none"
	stroke={`color-mix(in srgb, ${color} 70%, black)`}
	stroke-width="3"
	stroke-linecap="butt"
/>
