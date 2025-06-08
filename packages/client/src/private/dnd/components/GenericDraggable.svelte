<script
	lang="ts"
	generics="TItem extends DraggableItem, TExisting extends ExistingDraggableItem<TItem>"
>
import { dragManager } from '../drag-manager'
import type { DraggableItem, ExistingDraggableItem } from '../types'
import type { Snippet } from 'svelte'

type GenericDraggableProps<
	TItem extends DraggableItem,
	TExisting extends ExistingDraggableItem<TItem>,
> = {
	children: Snippet
} & (
	| {
			item: TItem
			existingItemInstance?: never
			sourceZoneId?: never
	  }
	| {
			item?: never
			existingItemInstance: TExisting
			sourceZoneId: string
	  }
)

const {
	item: itemData,
	existingItemInstance,
	sourceZoneId,
	children,
}: GenericDraggableProps<TItem, TExisting> = $props()

function handleMouseDown(event: MouseEvent) {
	if (existingItemInstance && sourceZoneId) {
		dragManager.startDraggingExistingItem(existingItemInstance, sourceZoneId, event)
	} else if (itemData) {
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
