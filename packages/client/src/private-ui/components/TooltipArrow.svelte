<script lang="ts">
interface Props {
	direction?: 'above' | 'below'
	color?: string
	borderWidth?: number
	pointerOverlap?: number
}
let {
	direction = 'above',
	color = '#e5e7eb',
	borderWidth = 1,
	pointerOverlap = -4,
}: Props = $props()

const style = $derived(
	direction === 'above'
		? `position: absolute; left: 50%; top: 100%; transform: translateX(-50%); margin-top: ${pointerOverlap}px;`
		: `position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); margin-bottom: ${pointerOverlap}px;`,
)

const points = $derived(direction === 'above' ? '8,8 0,0 16,0' : '8,0 0,8 16,8')
</script>

<div class="w-4 h-4 overflow-visible" style={style}>
	<svg width="16" height="8" viewBox="0 0 16 8" class="block">
		<polygon points={points} fill="white" stroke={color} stroke-width={borderWidth} />
	</svg>
</div>
