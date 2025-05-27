<script lang="ts">
	import type { PlantPlacement } from '../../lib/plant-placement'
	import { dragState } from '../state/dragState'
	import type { GardenBed } from '../../lib/garden-bed'
	import { onDestroy } from 'svelte'
	import type { Garden } from '../../lib/garden'
	import GardenBedView from './GardenBedView.svelte'
	import {
		GardenBedLayoutCalculator,
		screenToGridCoordinates,
		isValidDrop,
	} from '../../lib/garden-bed-layout-calculator'
	import { DEFAULT_LAYOUT_PARAMS } from '../../lib/layout-constants'

	interface GardenProps {
		garden: Garden
		onMovePlantInBed: (bedId: string, plantId: string, newX: number, newY: number) => void
		onMovePlantToDifferentBed: (
			sourceBedId: string,
			targetBedId: string,
			plant: PlantPlacement,
			newX: number,
			newY: number,
		) => void
		edgeIndicators: {
			id: string
			plantAId: string
			plantBId: string
			color: string
		}[]
	}

	let {
		garden,
		onMovePlantInBed,
		onMovePlantToDifferentBed,
		edgeIndicators,
	}: GardenProps = $props()

	let { beds } = $derived(garden)
	let gardenRef: HTMLDivElement | null = null

	function handleTileMouseDown(plant: PlantPlacement, bedId: string, event: MouseEvent) {
		// Set dragState with draggedPlant, sourceBedId, and initial mouse position
		dragState.set({
			draggedPlant: plant,
			draggedTileSize: plant.plantTile.size || 1,
			dragOffset: { x: event.clientX, y: event.clientY },
			dragPosition: { x: event.clientX, y: event.clientY },
			highlightedCell: null,
			sourceBedId: bedId,
			targetBedId: bedId,
		})
		window.addEventListener('mousemove', onGardenMouseMove)
		window.addEventListener('mouseup', onGardenMouseUp)
	}

	function onGardenMouseMove(event: MouseEvent) {
		// For each bed, check if mouse is over its SVG
		for (const bed of beds) {
			const svgElement: (SVGSVGElement & SVGGraphicsElement) | null =
				document.querySelector(`[data-bed-id='${bed.id}'] svg`)
			if (!svgElement) continue
			const rect = svgElement.getBoundingClientRect()

			if (
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom
			) {
				// Mouse is over this bed
				// Create a layout calculator for this specific bed to get accurate metrics
				const layout = new GardenBedLayoutCalculator({
					width: bed.width,
					height: bed.height,
					// Use default layout params from constants
					...DEFAULT_LAYOUT_PARAMS,
				})

				// Use the factored-out screenToGridCoordinates
				const { x, y } = screenToGridCoordinates(
					svgElement,
					layout,
					event.clientX,
					event.clientY,
				)

				dragState.update((s) => ({
					...s,
					targetBedId: bed.id,
					dragPosition: { x: event.clientX, y: event.clientY },
					highlightedCell: { x, y },
				}))
				return
			}
		}
		// If not over any bed, clear targetBedId and highlightedCell
		dragState.update((s) => ({
			...s,
			targetBedId: null,
			highlightedCell: null,
			dragPosition: { x: event.clientX, y: event.clientY },
		}))
	}

	function onGardenMouseUp(_event: MouseEvent) {
		const state = $dragState
		console.log('[GardenView] onGardenMouseUp: state', JSON.parse(JSON.stringify(state)))

		// Ensure all required state properties for a valid drop are non-null
		if (
			state.draggedPlant &&
			state.sourceBedId &&
			state.targetBedId &&
			state.highlightedCell
		) {
			const draggedPlant = state.draggedPlant
			const highlightedCell = state.highlightedCell
			// After this check, sourceBedId, targetBedId are confirmed strings
			// and highlightedCell is a confirmed object.
			const currentSourceBedId = state.sourceBedId
			const currentTargetBedId = state.targetBedId

			const targetBed = beds.find((b: GardenBed) => b.id === currentTargetBedId)

			console.log(
				'[GardenView] onGardenMouseUp: Details - ',
				'Dragged Plant ID:',
				draggedPlant.id,
				'Original Coords:',
				{ x: draggedPlant.x, y: draggedPlant.y },
				'Size:',
				state.draggedTileSize,
				'Target Bed ID:',
				targetBed ? targetBed.id : 'null',
				'Source Bed ID:',
				currentSourceBedId,
				'Highlighted Cell:',
				highlightedCell,
			)

			if (!targetBed) {
				console.log('[GardenView] onGardenMouseUp: No target bed found. Cleaning up.')
				cleanupDrag()
				return
			}

			const isValid = isValidDrop(
				targetBed,
				draggedPlant,
				highlightedCell.x,
				highlightedCell.y,
			)
			console.log(
				'[GardenView] onGardenMouseUp: isValidDrop returned:',
				isValid,
				'for cell:',
				highlightedCell,
				'in bed:',
				currentTargetBedId,
			)

			if (!isValid) {
				console.log('[GardenView] onGardenMouseUp: Drop is not valid. Cleaning up.')
				cleanupDrag()
				return
			}

			if (currentSourceBedId === currentTargetBedId) {
				// Move within the same bed
				onMovePlantInBed(
					currentSourceBedId,
					draggedPlant.id,
					highlightedCell.x,
					highlightedCell.y,
				)
			} else {
				// Move to a different bed
				onMovePlantToDifferentBed(
					currentSourceBedId,
					currentTargetBedId,
					draggedPlant,
					highlightedCell.x,
					highlightedCell.y,
				)
			}
		} else {
			console.log(
				'[GardenView] onGardenMouseUp: Aborted due to null state properties (draggedPlant, sourceBedId, targetBedId, or highlightedCell).',
			)
		}
		cleanupDrag()
	}

	function cleanupDrag(): void {
		dragState.set({
			draggedPlant: null,
			draggedTileSize: 1,
			dragOffset: null,
			dragPosition: null,
			highlightedCell: null,
			sourceBedId: null,
			targetBedId: null,
		})
		window.removeEventListener('mousemove', onGardenMouseMove)
		window.removeEventListener('mouseup', onGardenMouseUp)
	}

	onDestroy(() => {
		window.removeEventListener('mousemove', onGardenMouseMove)
		window.removeEventListener('mouseup', onGardenMouseUp)
	})
</script>

<style>
</style>

<div class="garden" bind:this={gardenRef}>
	{#each beds as bed (bed.id)}
		<GardenBedView
			bed={bed}
			edgeIndicators={edgeIndicators}
			onTileMouseDownFromParent={handleTileMouseDown}
		/>
	{/each}
</div>
