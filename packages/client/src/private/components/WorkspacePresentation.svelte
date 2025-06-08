<script lang="ts">
import { dragState } from '../../private/dnd/state'
import GridViewToolbar from '../grid/components/GridViewToolbar.svelte'
import DeleteZone from '../../private/grid/ui/DeleteZone.svelte'
import DragPreview from '../../private/grid/ui/DragPreview.svelte'
import type { Workspace } from '../../lib/entities/workspace'
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
import { plants } from '../../lib/state/plantsStore'
import { isGridPlaceable, isGridPlacement } from '../../private/grid/grid-placement'
import ZoneGrid from '../grid/components/ZoneGrid.svelte'
import HorizontalBarMeter from '../../components/HorizontalBarMeter.svelte'
import IdLabel from '../../lib/components/IdLabel.svelte'
import type { WithId } from '../../lib/entities/with-id'

interface WorkspaceProps {
	workspace: Workspace
	onRequestPlacement: (
		details: PlacementRequestDetails<WithId>,
		pendingOpId?: string,
	) => Promise<void>
	onRequestRemoval: (
		details: RemovalRequestDetails<WithId>,
		pendingOpId?: string,
	) => Promise<void>
	onRequestCloning: (
		details: CloningRequestDetails<WithId>,
		pendingOpId?: string,
	) => Promise<void>
}

let {
	workspace,
	onRequestPlacement,
	onRequestRemoval,
	onRequestCloning,
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
			size: safeGetItemSize(draggedExistingItem.item),
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
					size: safeGetItemSize(existingItem.item),
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
					size: safeGetItemSize(existingItem.item),
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
				size: safeGetItemSize(currentDragState.draggedNewItem),
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

// Function to safely get item size, avoiding validation errors
function safeGetItemSize(item: WithId): number {
	if (!isGridPlaceable(item)) {
		console.warn('Item is not a grid placeable', item)
		return 1
	}
	return item.size
}

let zoneCardColSpans = $derived(calculateZoneViewColSpans(workspace))

const getColSpanClass = (zoneId: string) => {
	const colSpan = zoneCardColSpans[zoneId] ?? 1
	switch (colSpan) {
		case 1:
			return 'col-span-1'
		case 2:
			return 'col-span-2'
		case 3:
			return 'col-span-3'
		case 4:
			return 'col-span-4'
		case 5:
			return 'col-span-5'
		default:
			return 'col-span-1'
	}
}
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

.meters-row {
	display: flex;
	flex-direction: row;
	gap: 17px;
	justify-content: left;
	align-items: center;
	margin-bottom: 1em;
	margin-top: 0;
}
</style>

<div class="workspace-container">
	<GridViewToolbar items={$plants} />

	<div
		class="workspace"
		{@attach workspaceDragCoordinator({
			dragState,
			zones: zones,
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
				<div class="card bg-base-100 shadow-sm {getColSpanClass(zone.id)}">
					<ZoneGrid zone={zone} indicators={workspace.indicators} />
					<div class="card-body">
						<div class="card-title flex justify-between items-center">
							Work Zone ({zone.width}×{zone.height} units)
							<IdLabel id={zone.id} />
						</div>

						<div class="meters-row">
							<HorizontalBarMeter
								id={`${zone.id}-water`}
								value={zone.waterLevel}
								max={5}
								filledColor="#3498db"
								emptyColor="#3498db22"
								borderColor="#3498db"
								label="Water"
								labelColor="#3498db"
							/>
							<HorizontalBarMeter
								id={`${zone.id}-sun`}
								value={zone.sunLevel}
								max={5}
								filledColor="#FFD600"
								emptyColor="#FFD60022"
								borderColor="#FFD600"
								label="Sun"
								labelColor="#FF6666"
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<DeleteZone />
	<DragPreview grids={zones} />
</div>
