<script lang="ts">
import GardenDiagram from '../private-ui/components/GardenDiagram.svelte'
import PageTitle from '../private-ui/components/PageTitle.svelte'

const { route } = $props()
</script>

<PageTitle route={route} />

<GardenDiagram />
