<script lang="ts">
import { dragState } from '../state/dragState'
import PlantToolbar from './PlantToolbar.svelte'
import DeleteZone from './DeleteZone.svelte'
import DragPreview from './DragPreview.svelte'
import type { Garden } from '../../private-lib/garden'
import GardenBedView from './GardenBedView.svelte'
import { calculateGardenBedViewColSpans } from '../../private-lib/garden-bed-layout-calculator'
import type {
	ExistingGardenItem,
	PlacementRequestDetails,
	RemovalRequestDetails,
	CloningRequestDetails,
} from '../state/gardenDragState'
import { gardenDragCoordinator } from '../../private-lib/attachments/gardenDragCoordinator'
import type { Plant } from '../../private-lib/plant'
import {
	addPendingOperation,
	updatePendingOperation,
	removePendingOperation,
} from '../../private-lib/dnd/validation'
import { plants, plantsLoading, plantsError, plantsReady } from '../state/plantsStore'

interface GardenProps {
	garden: Garden
	onMovePlantInBed: (bedId: string, plantId: string, newX: number, newY: number) => void
	onMovePlantToDifferentBed: (
		sourceBedId: string,
		targetBedId: string,
		existingItem: ExistingGardenItem,
		newX: number,
		newY: number,
	) => void
	onAddNewPlant: (bedId: string, item: Plant, x: number, y: number) => void
	onDeletePlant: (plantId: string, bedId: string) => void
	edgeIndicators: {
		id: string
		plantAId: string
		plantBId: string
		color: string
	}[]
	onRequestPlacement: (details: PlacementRequestDetails) => Promise<void>
	onRequestRemoval: (details: RemovalRequestDetails) => Promise<void>
	onRequestCloning: (details: CloningRequestDetails) => Promise<void>
}

let {
	garden,
	onMovePlantInBed,
	onMovePlantToDifferentBed,
	onAddNewPlant,
	onDeletePlant,
	edgeIndicators,
	onRequestPlacement,
	onRequestRemoval,
	onRequestCloning,
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
		// Create pending operation for removal
		const pendingOpId = addPendingOperation({
			type: 'removal',
			state: 'pending',
			zoneId: sourceZoneId,
			item: draggedExistingItem.itemData,
			size: (draggedExistingItem.itemData as Plant).plantingDistanceInFeet,
			originalSourceZoneId: sourceZoneId,
			originalInstanceId: draggedExistingItem.id,
		})

		try {
			await onRequestRemoval({
				itemData: draggedExistingItem.itemData as Plant,
				instanceId: draggedExistingItem.id,
				sourceZoneId: sourceZoneId,
				operationType: 'item-remove-from-zone',
			})
			// Validation succeeded - now perform the actual deletion
			updatePendingOperation(pendingOpId, 'success')
			onDeletePlant(draggedExistingItem.id, sourceZoneId)
			setTimeout(() => {
				removePendingOperation(pendingOpId)
			}, 1000) // Show success for 1 second
		} catch (error) {
			console.error('Removal validation failed:', error)
			// Validation failed - do not perform deletion
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

			if (dropInfo.isCloneMode) {
				// Create pending operation for cloning
				const pendingOpId = addPendingOperation({
					type: 'placement',
					state: 'pending',
					zoneId: dropInfo.targetZoneId,
					item: existingItem.itemData,
					size: (existingItem.itemData as Plant).plantingDistanceInFeet,
					x,
					y,
					originalSourceZoneId: sourceBedId,
					originalInstanceId: existingItem.id,
				})

				try {
					await onRequestCloning({
						itemDataToClone: existingItem.itemData as Plant,
						sourceOriginalZoneId: sourceBedId,
						targetCloneZoneId: dropInfo.targetZoneId,
						sourceOriginalX: existingItem.x ?? 0,
						sourceOriginalY: existingItem.y ?? 0,
						targetCloneX: x,
						targetCloneY: y,
						operationType: 'item-clone-in-zone',
					})
					// Validation succeeded - now perform the actual clone
					updatePendingOperation(pendingOpId, 'success')
					if (!dropInfo.targetZoneId) return
					onAddNewPlant(dropInfo.targetZoneId, existingItem.itemData as Plant, x, y)
					setTimeout(() => {
						removePendingOperation(pendingOpId)
					}, 1000) // Show success for 1 second
				} catch (error) {
					console.error('Cloning validation failed:', error)
					// Validation failed - do not perform clone
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
					item: existingItem.itemData,
					size: (existingItem.itemData as Plant).plantingDistanceInFeet,
					x,
					y,
					originalSourceZoneId: sourceBedId,
					originalInstanceId: existingItem.id,
				})

				try {
					await onRequestPlacement({
						itemData: existingItem.itemData as Plant,
						targetZoneId: dropInfo.targetZoneId,
						x,
						y,
						operationType,
						originalInstanceId: existingItem.id,
						sourceZoneId: sourceBedId,
					})
					// Validation succeeded - now perform the actual operation
					updatePendingOperation(pendingOpId, 'success')
					if (operationType === 'item-move-within-zone') {
						onMovePlantInBed(dropInfo.targetZoneId, existingItem.id, x, y)
					} else {
						onMovePlantToDifferentBed(
							sourceBedId,
							dropInfo.targetZoneId,
							existingItem as ExistingGardenItem,
							x,
							y,
						)
					}
					setTimeout(() => {
						removePendingOperation(pendingOpId)
					}, 1000) // Show success for 1 second
				} catch (error) {
					console.error('Placement validation failed:', error)
					// Validation failed - do not perform operation
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
				size: (currentDragState.draggedNewItem as Plant).plantingDistanceInFeet,
				x,
				y,
			})

			try {
				await onRequestPlacement({
					itemData: currentDragState.draggedNewItem as Plant,
					targetZoneId: dropInfo.targetZoneId,
					x,
					y,
					operationType: 'item-add-to-zone',
				})
				// Validation succeeded - now perform the actual placement
				updatePendingOperation(pendingOpId, 'success')
				if (!dropInfo.targetZoneId) return
				onAddNewPlant(
					dropInfo.targetZoneId,
					currentDragState.draggedNewItem as Plant,
					x,
					y,
				)
				setTimeout(() => {
					removePendingOperation(pendingOpId)
				}, 1000) // Show success for 1 second
			} catch (error) {
				console.error('Placement validation failed:', error)
				// Validation failed - do not perform placement
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
		<PlantToolbar plants={$plants} />

		<div
			class="garden"
			{@attach gardenDragCoordinator({
				dragState,
				beds,
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
					<GardenBedView
						bed={bed}
						plants={$plants}
						edgeIndicators={edgeIndicators.filter(
							(edge) =>
								beds
									.find((b) => b.id === bed.id)
									?.plantPlacements.some(
										(p) => p.id === edge.plantAId || p.id === edge.plantBId,
									) ?? false,
						)}
						colSpan={gardenBedCardColSpans[bed.id] ?? 1}
					/>
				{/each}
			</div>
		</div>

		<DeleteZone />
		<DragPreview beds={beds} />
	{/if}
</div>
