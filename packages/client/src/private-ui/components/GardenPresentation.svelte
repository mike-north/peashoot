<script lang="ts">
import { dragState } from '../../private/dnd/state'
import GridViewToolbar from './GridViewToolbar.svelte'
import DeleteZone from '../../private/grid/ui/DeleteZone.svelte'
import DragPreview from '../../private/grid/ui/DragPreview.svelte'
import type { Garden } from '../../lib/entities/garden'
import { calculateGardenBedViewColSpans } from '../../private-lib/garden-bed-layout-calculator'
import type {
	ExistingGardenItem,
	PlacementRequestDetails,
	RemovalRequestDetails,
	CloningRequestDetails,
} from '../../private/state/gardenDragState'
import { gardenDragCoordinator } from '../../private/grid/attachments/gardenDragCoordinator'
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
import PlantTooltipContent from '../../lib/PlantTooltipContent.svelte'
import type { PlantWithSize } from '../../lib/entities/garden-bed'
import { isGridPlaceable, isGridPlacement } from '../../private/grid/grid-placement'
import type { DraggableItem } from '../state/dragState'
import GardenBedGrid from '../../components/GardenBedGrid.svelte'

interface GardenProps {
	garden: Garden
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
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
	garden,
	edgeIndicators,
	onRequestPlacement,
	onRequestRemoval,
	onRequestCloning,
	tileSizeForItem,
	categoryNameForItem,
}: GardenProps = $props()

let { beds } = $derived(garden)

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
		// Cast to ExistingGardenItem to access x and y coordinates

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
			const sourceBedId = sourceZoneId
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
					originalSourceZoneId: sourceBedId,
					originalInstanceId: existingItem.id,
				})

				try {
					await onRequestCloning(
						{
							itemDataToClone: existingItem.item,
							sourceOriginalZoneId: sourceBedId,
							targetCloneZoneId: dropInfo.targetZoneId,
							sourceOriginalX: (existingItem as ExistingGardenItem<PlantWithSize>).x,
							sourceOriginalY: (existingItem as ExistingGardenItem<PlantWithSize>).y,
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
					sourceBedId === dropInfo.targetZoneId
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
					originalSourceZoneId: sourceBedId,
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
							sourceZoneId: sourceBedId,
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
			// Create pending operation for new plant
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

let gardenBedCardColSpans = $derived(calculateGardenBedViewColSpans(garden))
</script>

<style>
.garden-container {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.garden {
	flex: 1;
	overflow: auto;
	padding: 1rem;
}
</style>

<div class="garden-container">
	{#if $plantsError}
		<div class="flex justify-center items-center h-full p-8">
			<div class="text-error text-lg font-bold">Error loading plants: {$plantsError}</div>
		</div>
	{:else if $plantsLoading}
		<div class="flex justify-center items-center h-full p-8">
			<span class="loading loading-ring loading-xl"></span>
			<div class="text-md font-bold">Loading plants...</div>
		</div>
	{:else if $plantsReady}
		<GridViewToolbar
			TooltipComponent={PlantTooltipContent}
			items={$plants}
			categoryNameForItem={categoryNameForItem}
		/>

		<div
			class="garden"
			{@attach gardenDragCoordinator({
				dragState,
				beds,
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
				{#each beds as bed (bed.id)}
					<GardenBedGrid
						TooltipComponent={PlantTooltipContent}
						bed={bed}
						plants={$plants}
						edgeIndicators={edgeIndicators.filter(
							(edge) =>
								beds
									.find((b) => b.id === bed.id)
									?.placements.some(
										(p) => p.id === edge.plantAId || p.id === edge.plantBId,
									) ?? false,
						)}
						colSpan={gardenBedCardColSpans[bed.id] ?? 1}
						tileSizeForItem={tileSizeForItem}
					/>
				{/each}
			</div>
		</div>

		<DeleteZone />
		<DragPreview grids={beds} tileSizeForItem={tileSizeForItem} />
	{/if}
</div>
