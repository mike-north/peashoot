<script lang="ts">
// This file now redirects to the new WorkspacePage with generic terminology
// The old garden-specific implementation is preserved but uses the new workspace system
import WorkspacePage from './WorkspacePage.svelte'

const { route } = $props()
</script>

<!-- Garden page now uses the generic workspace system -->
<WorkspacePage route={route} />
