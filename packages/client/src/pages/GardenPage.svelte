<script lang="ts">
import type { Item } from '@peashoot/types'
import {
	VALIDATION_RULE_SET,
	WorkspaceController,
} from '../lib/controllers/workspace-controller'
// This file now redirects to the new WorkspacePage with generic terminology
// The old garden-specific implementation is preserved but uses the new workspace system
import WorkspacePage from './WorkspacePage.svelte'

const { route } = $props()

const controller = new WorkspaceController<Item>({
	validationRules: VALIDATION_RULE_SET,
})
</script>

<!-- Garden page now uses the generic workspace system -->
<WorkspacePage route={route} controller={controller} />
