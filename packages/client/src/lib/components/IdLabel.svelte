<script lang="ts">
interface Props {
	id: string
}

let { id }: Props = $props()
</script>

<style lang="scss">
.id-label {
	display: inline-block;
	font-size: 12px;
	font-weight: bold;
	color: var(--color-neutral-900);
	background-color: var(--color-neutral-200);
	padding: 2px 6px;
	border-radius: 2px;
	code {
		display: inline-block;
	}
}
</style>

<span class="id-label">
	<code>{id}</code>
</span>
