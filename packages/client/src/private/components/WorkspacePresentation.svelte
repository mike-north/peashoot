<script lang="ts">
import { dragState } from '../../private/dnd/state'
import GridViewToolbar from '../grid/components/GridViewToolbar.svelte'
import DeleteZone from '../../private/grid/ui/DeleteZone.svelte'
import DragPreview from '../../private/grid/ui/DragPreview.svelte'
import type { EdgeIndicator, Workspace } from '../../lib/entities/workspace'
import { calculateZoneViewColSpans } from '../grid/zone-layout-calculator'
import type {
	PlacementRequestDetails,
	RemovalRequestDetails,
	CloningRequestDetails,
} from '../../private/state/workspaceDragState'
import { workspaceDragCoordinator } from '../../private/grid/attachments/workspaceDragCoordinator'
import {
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
} from '../../private/dnd/validation'
import {
	plants,
	plantsLoading,
	plantsError,
	plantsReady,
} from '../../private/state/plantsStore'
import ItemTooltipContent from '../../lib/ItemTooltipContent.svelte'
import { isGridPlaceable, isGridPlacement } from '../../private/grid/grid-placement'
import type { DraggableItem } from '../dnd/types'
import ZoneGrid from '../../components/ZoneGrid.svelte'

interface WorkspaceProps {
	workspace: Workspace
	edgeIndicators: EdgeIndicator[]
	onRequestPlacement: (
		details: PlacementRequestDetails<DraggableItem>,
		pendingOpId?: string,
	) => Promise<void>
	onRequestRemoval: (
		details: RemovalRequestDetails<DraggableItem>,
		pendingOpId?: string,
	) => Promise<void>
	onRequestCloning: (
		details: CloningRequestDetails<DraggableItem>,
		pendingOpId?: string,
	) => Promise<void>
	tileSizeForItem: (item: DraggableItem) => number
	categoryNameForItem: (item: DraggableItem) => string
}

let {
	workspace,
	edgeIndicators,
	onRequestPlacement,
	onRequestRemoval,
	onRequestCloning,
	tileSizeForItem,
	categoryNameForItem,
}: WorkspaceProps = $props()

let { zones } = $derived(workspace)

// Handle drop events from the drag coordinator
async function handleDrop(dropInfo: {
	targetZoneId: string | null
	targetType: 'drop-zone' | 'delete-zone' | null
	highlightedCell: { x: number; y: number } | null
	isCloneMode: boolean
}) {
	const currentDragState = $dragState

	// Clean up drag state immediately
	dragState.set({
		draggedNewItem: null,
		draggedExistingItem: null,
		dragSourceType: 'existing-item',
		sourceZoneId: null,
		targetZoneId: null,
		targetType: null,
		dragPosition: { x: 0, y: 0 },
		dragOffset: { x: 0, y: 0 },
		highlightedCell: null,
		isCloneMode: false,
		draggedItemEffectiveSize: 1,
	})
	const { sourceZoneId, draggedExistingItem } = currentDragState
	// Handle different drop scenarios
	if (sourceZoneId && dropInfo.targetType === 'delete-zone' && draggedExistingItem) {
		// Cast to ExistingWorkspaceItem to access x and y coordinates

		if (!isGridPlacement(draggedExistingItem, isGridPlaceable))
			throw new Error('Dragged item is not a grid placeable')

		// Create pending operation for removal
		const pendingOpId = addPendingOperation({
			type: 'removal',
			state: 'pending',
			zoneId: sourceZoneId,
			item: draggedExistingItem.item,
			size: tileSizeForItem(draggedExistingItem.item),
			x: draggedExistingItem.x,
			y: draggedExistingItem.y,
			originalSourceZoneId: sourceZoneId,
			originalInstanceId: draggedExistingItem.id,
		})

		try {
			await onRequestRemoval(
				{
					itemData: draggedExistingItem.item,
					instanceId: draggedExistingItem.id,
					sourceZoneId: sourceZoneId,
					operationType: 'item-remove-from-zone',
				},
				pendingOpId,
			)
			// Request handled - pending operation management is now done by the handler
		} catch (error) {
			console.error('Removal request failed:', error)
			// Request failed due to system error - handler didn't manage pending operation
			updatePendingOperation(pendingOpId, 'error')
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, 2000) // Show error for 2 seconds
		}
	} else if (
		dropInfo.targetType === 'drop-zone' &&
		dropInfo.targetZoneId &&
		dropInfo.highlightedCell
	) {
		const { x, y } = dropInfo.highlightedCell

		if (sourceZoneId && draggedExistingItem) {
			const existingItem = draggedExistingItem
			const sourceZoneIdValue = sourceZoneId
			if (!isGridPlacement(existingItem, isGridPlaceable))
				throw new Error('Dragged item is not a grid placeable')

			if (dropInfo.isCloneMode) {
				// Create pending operation for cloning
				const pendingOpId = addPendingOperation({
					type: 'placement',
					state: 'pending',
					zoneId: dropInfo.targetZoneId,
					item: existingItem.item,
					size: tileSizeForItem(existingItem.item),
					x,
					y,
					originalSourceZoneId: sourceZoneIdValue,
					originalInstanceId: existingItem.id,
				})

				try {
					await onRequestCloning(
						{
							itemDataToClone: existingItem.item,
							sourceOriginalZoneId: sourceZoneIdValue,
							targetCloneZoneId: dropInfo.targetZoneId,
							sourceOriginalX: existingItem.x,
							sourceOriginalY: existingItem.y,
							targetCloneX: x,
							targetCloneY: y,
							operationType: 'item-clone-in-zone',
						},
						pendingOpId,
					)
					// Request handled - pending operation management is now done by the handler
				} catch (error) {
					console.error('Cloning request failed:', error)
					// Request failed due to system error - handler didn't manage pending operation
					updatePendingOperation(pendingOpId, 'error')
					setTimeout(() => {
						removePendingOperation(pendingOpId)
					}, 2000) // Show error for 2 seconds
				}
			} else {
				const operationType =
					sourceZoneIdValue === dropInfo.targetZoneId
						? 'item-move-within-zone'
						: 'item-move-across-zones'

				// Create pending operation for move
				const pendingOpId = addPendingOperation({
					type: 'placement',
					state: 'pending',
					zoneId: dropInfo.targetZoneId,
					item: existingItem.item,
					size: tileSizeForItem(existingItem.item),
					x,
					y,
					originalSourceZoneId: sourceZoneIdValue,
					originalInstanceId: existingItem.id,
				})

				try {
					await onRequestPlacement(
						{
							itemData: existingItem.item,
							targetZoneId: dropInfo.targetZoneId,
							x,
							y,
							operationType,
							originalInstanceId: existingItem.id,
							sourceZoneId: sourceZoneIdValue,
						},
						pendingOpId,
					)
					// Request handled - pending operation management is now done by the handler
				} catch (error) {
					console.error('Placement request failed:', error)
					// Request failed due to system error - handler didn't manage pending operation
					updatePendingOperation(pendingOpId, 'error')
					setTimeout(() => {
						removePendingOperation(pendingOpId)
					}, 2000) // Show error for 2 seconds
				}
			}
		} else if (currentDragState.draggedNewItem) {
			// Create pending operation for new item
			const pendingOpId = addPendingOperation({
				type: 'placement',
				state: 'pending',
				zoneId: dropInfo.targetZoneId,
				item: currentDragState.draggedNewItem,
				size: tileSizeForItem(currentDragState.draggedNewItem),
				x,
				y,
			})

			try {
				if (!isGridPlaceable(currentDragState.draggedNewItem))
					throw new Error('Dragged item is not a grid placeable')

				await onRequestPlacement(
					{
						itemData: currentDragState.draggedNewItem,
						targetZoneId: dropInfo.targetZoneId,
						x,
						y,
						operationType: 'item-add-to-zone',
					},
					pendingOpId,
				)
				// Request handled - pending operation management is now done by the handler
			} catch (error) {
				console.error('Placement request failed:', error)
				// Request failed due to system error - handler didn't manage pending operation
				updatePendingOperation(pendingOpId, 'error')
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, 2000) // Show error for 2 seconds
			}
		}
	}
}

let zoneCardColSpans = $derived(calculateZoneViewColSpans(workspace))
</script>

<style>
.workspace-container {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.workspace {
	flex: 1;
	overflow: auto;
	padding: 1rem;
}
</style>

<div class="workspace-container">
	{#if $plantsError}
		<div class="flex justify-center items-center h-full p-8">
			<div class="text-error text-lg font-bold">Error loading items: {$plantsError}</div>
		</div>
	{:else if $plantsLoading}
		<div class="flex justify-center items-center h-full p-8">
			<span class="loading loading-ring loading-xl"></span>
			<div class="text-md font-bold">Loading items...</div>
		</div>
	{:else if $plantsReady}
		<GridViewToolbar
			TooltipComponent={ItemTooltipContent}
			items={$plants}
			categoryNameForItem={categoryNameForItem}
		/>

		<div
			class="workspace"
			{@attach workspaceDragCoordinator({
				dragState,
				zones: zones,
				tileSizeForItem,
				onDrop: (dropInfo) => {
					handleDrop(dropInfo).catch((error: unknown) => {
						console.error('Drop failed:', error)
					})
				},
			})}
		>
			<div
				class="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
			>
				{#each zones as zone (zone.id)}
					<ZoneGrid
						TooltipComponent={ItemTooltipContent}
						zone={zone}
						items={$plants}
						edgeIndicators={edgeIndicators.filter(
							(edge) =>
								zones
									.find((z) => z.id === zone.id)
									?.placements.some(
										(p) => p.id === edge.itemAId || p.id === edge.itemBId,
									) ?? false,
						)}
						indicators={workspace.indicators.filter(
							(indicator) => indicator.zoneId === zone.id,
						)}
						colSpan={zoneCardColSpans[zone.id] ?? 1}
						tileSizeForItem={tileSizeForItem}
					/>
				{/each}
			</div>
		</div>

		<DeleteZone />
		<DragPreview grids={zones} tileSizeForItem={tileSizeForItem} />
	{/if}
</div>
