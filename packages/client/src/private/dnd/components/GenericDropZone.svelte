<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script lang="ts" generics="TZoneCtx extends DropZoneContext">
import type { Snippet } from 'svelte'
import { dragState as genericDragState } from '../state'
import { get } from 'svelte/store'
import type { DropZoneContext } from '../types'
import type { WithId } from '../../../lib/entities/with-id'

interface DropEventPayload {
	item: WithId
	sourceZoneId: string | null
	targetZoneId: string
	x?: number
	y?: number
	isClone: boolean
}

interface Props {
	zoneId: string
	children: Snippet
	onDrop?: (payload: DropEventPayload) => void
	// TODO: Add props for enabling/disabling drop, validation functions, etc.
	// acceptFilter?: (item: DraggableItem) => boolean;
	// onDrop?: (item: DraggableItem, zoneContext: TZoneCtx) => void; // This was a comment, we'll use the one above
	// onDragEnter?: (item: DraggableItem, zoneContext: TZoneCtx) => void;
	// onDragLeave?: (item: DraggableItem, zoneContext: TZoneCtx) => void;
	// onDragOver?: (item: DraggableItem, zoneContext: TZoneCtx, x: number, y:number) => void;
}

const { zoneId, children, onDrop }: Props = $props()

let zoneElement: HTMLElement | null = null

// TODO: Implement event handlers (onMouseEnter, onMouseLeave, onMouseMove, onMouseUp)
// These will interact with dragState to set targetZoneId, targetType, highlightedCell etc.
// and ultimately trigger drop actions / validations.

// Example of how it might update dragState on mouse enter
function handleMouseEnter(_event: MouseEvent) {
	const currentDragStateVal = get(genericDragState)
	// console.log(`[GenericDropZone ${zoneId}] MouseEnter. Drag in progress?`, !!(currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem), 'Current targetZoneId before update:', currentDragStateVal.targetZoneId);

	if (currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem) {
		genericDragState.update((s) => {
			// console.log(`[GenericDropZone ${zoneId}] Updating targetZoneId to ${zoneId}. Previous: ${s.targetZoneId}`);
			return {
				...s,
				targetZoneId: zoneId,
				targetType: 'drop-zone',
			}
		})
	}
}

function handleMouseLeave(_event: MouseEvent) {
	const currentDragStateVal = get(genericDragState)
	if (currentDragStateVal.targetZoneId === zoneId) {
		genericDragState.update((s) => ({
			...s,
			targetZoneId: null,
			targetType: null,
			highlightedCell: null, // Clear highlight when leaving zone
		}))
	}
}

// handleMouseMove and celldragover dispatch removed

function handleMouseUp(_event: MouseEvent) {
	const currentDragStateVal = get(genericDragState)

	if (currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem) {
		// console.log(`[GenericDropZone] MouseUp on zone ${zoneId}.`);

		const itemToDrop =
			currentDragStateVal.draggedNewItem || currentDragStateVal.draggedExistingItem?.item

		if (itemToDrop && onDrop) {
			const payloadBase: DropEventPayload = {
				item: itemToDrop,
				sourceZoneId: currentDragStateVal.sourceZoneId,
				targetZoneId: zoneId,
				isClone: currentDragStateVal.isCloneMode,
			}

			// console.log(`[GenericDropZone ${zoneId}] Dispatching drop event.`);
			if (currentDragStateVal.highlightedCell) {
				onDrop({
					...payloadBase,
					x: currentDragStateVal.highlightedCell.x,
					y: currentDragStateVal.highlightedCell.y,
				})
			} else {
				onDrop(payloadBase)
			}
		}
	}
}
</script>

<div
	role="presentation"
	bind:this={zoneElement}
	class="generic-drop-zone"
	data-zone-id={zoneId}
	style="display: block; min-height: 50px; position: relative;"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmouseup={handleMouseUp}
>
	{@render children()}
	<!-- TODO: You might want to use zoneContextData here eventually, or pass via events -->
</div>

<!-- 
	Note on native HTML5 Drag and Drop API vs. Mouse Events:
	This implementation uses mouse events (mousedown, mousemove, mouseup, mouseenter, mouseleave)
	to simulate drag and drop. This provides more control and works consistently across
	browsers and devices, especially for custom drag previews and complex interactions.

	The native HTML5 Drag and Drop API events (dragstart, dragenter, dragover, dragleave, drop, dragend)
	can also be used, but they have some quirks and limitations, particularly around drag image
	customization and event propagation. For this refactor, simulating with mouse events
	aligns well with the existing dragState management.
-->
