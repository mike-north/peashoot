<script
	lang="ts"
	generics="TItem extends DraggableItem, TExisting extends ExistingDraggableItem<TItem>"
>
import { dragManager } from '../drag-manager' // Updated path
import type { DraggableItem, ExistingDraggableItem } from '../types' // Updated path
import type { Snippet } from 'svelte'

interface Props {
	item: TItem // Core data for a new item, or itemData within an existing one
	existingItemInstance?: TExisting // If this is an existing item being dragged
	sourceZoneId?: string // Required if existingItemInstance is provided
	children: Snippet
}

const { item: itemData, existingItemInstance, sourceZoneId, children }: Props = $props()

function handleMouseDown(event: MouseEvent) {
	if (existingItemInstance && sourceZoneId) {
		// Ensure that TExisting passed to dragManager matches its expectation
		dragManager.startDraggingExistingItem(existingItemInstance, sourceZoneId, event)
	} else {
		dragManager.startDraggingNewItem(itemData, event)
	}
}
</script>

<div
	class="generic-draggable"
	onmousedown={handleMouseDown}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleMouseDown(new MouseEvent('mousedown'))
		}
	}}
	style="cursor: grab; display: inline-block;"
>
	{@render children()}
</div>
