<script lang="ts">
import { dragState } from '../state/dragState'
import PlantToolbar, { type PlantToolbarPlantFamily } from './PlantToolbar.svelte'
import DeleteZone from './DeleteZone.svelte'
import DragPreview from './DragPreview.svelte'
import { onMount } from 'svelte'
import type { Garden } from '../../private-lib/garden'
import GardenBedView from './GardenBedView.svelte'
import { calculateGardenBedViewColSpans } from '../../private-lib/garden-bed-layout-calculator'
import type {
	GardenItem,
	ExistingGardenItem,
	PlacementRequestDetails,
	RemovalRequestDetails,
	CloningRequestDetails,
} from '../state/gardenDragState'
import { gardenDragCoordinator } from '../../private-lib/attachments/gardenDragCoordinator'
import { fetchPlantFamilies } from '../../lib/plant-data'

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
	onAddNewPlant: (bedId: string, item: GardenItem, x: number, y: number) => void
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

let plantFamilies = $state<PlantToolbarPlantFamily[]>([])

onMount(() => {
	fetchPlantFamilies()
		.then((pf) => {
			plantFamilies = pf
		})
		.catch((err: unknown) => {
			console.error('Error fetching plant families', { cause: err })
		})
})

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
		try {
			await onRequestRemoval({
				itemData: draggedExistingItem.itemData as GardenItem,
				instanceId: draggedExistingItem.id,
				sourceZoneId: sourceZoneId,
				operationType: 'item-remove-from-zone',
			})
			// Perform the actual deletion after successful validation
			onDeletePlant(draggedExistingItem.id, sourceZoneId)
		} catch (error) {
			console.error('Removal validation failed:', error)
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
				try {
					await onRequestCloning({
						itemDataToClone: existingItem.itemData as GardenItem,
						sourceOriginalZoneId: sourceBedId,
						targetCloneZoneId: dropInfo.targetZoneId,
						sourceOriginalX: existingItem.x ?? 0,
						sourceOriginalY: existingItem.y ?? 0,
						targetCloneX: x,
						targetCloneY: y,
						operationType: 'item-clone-in-zone',
					})
					// Perform the actual clone after successful validation
					onAddNewPlant(dropInfo.targetZoneId, existingItem.itemData as GardenItem, x, y)
				} catch (error) {
					console.error('Cloning validation failed:', error)
				}
			} else {
				const operationType =
					sourceBedId === dropInfo.targetZoneId
						? 'item-move-within-zone'
						: 'item-move-across-zones'

				try {
					await onRequestPlacement({
						itemData: existingItem.itemData as GardenItem,
						targetZoneId: dropInfo.targetZoneId,
						x,
						y,
						operationType,
						originalInstanceId: existingItem.id,
						sourceZoneId: sourceBedId,
					})
					// Perform the actual move after successful validation
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
				} catch (error) {
					console.error('Placement validation failed:', error)
				}
			}
		} else if (currentDragState.draggedNewItem) {
			try {
				await onRequestPlacement({
					itemData: currentDragState.draggedNewItem as GardenItem,
					targetZoneId: dropInfo.targetZoneId,
					x,
					y,
					operationType: 'item-add-to-zone',
				})
				// Perform the actual add after successful validation
				onAddNewPlant(
					dropInfo.targetZoneId,
					currentDragState.draggedNewItem as GardenItem,
					x,
					y,
				)
			} catch (error) {
				console.error('Placement validation failed:', error)
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
	{#if plantFamilies.length > 0}
		<PlantToolbar plantFamilies={plantFamilies} />
	{:else}
		<div class="flex justify-center items-center h-full p-8">
			<span class="loading loading-ring loading-xl"></span>
			<div class="text-md font-bold">Loading plant families...</div>
		</div>
	{/if}

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
		<div class="grid grid-flow-row-dense grid-cols-4 gap-4">
			{#each beds as bed (bed.id)}
				<GardenBedView
					bed={bed}
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
</div>
