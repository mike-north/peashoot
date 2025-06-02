<script lang="ts">
import type { SeedPacket } from '../lib/entities/seed-packet'

interface Props {
	seedPacket: SeedPacket
}

const { seedPacket }: Props = $props()
</script>

<div class="">
	<div class="flex justify-center">
		<img
			class="text-center mt-2 mb-2"
			style="max-height: 64px"
			src={`/plant-icons/${seedPacket.presentation.iconPath}`}
			alt="Sunflower"
		/>
	</div>
	<span class="font-bold text-xl">INFORMATION</span>
	<p>{seedPacket.description}</p>

	<p class="mb-2">
		<span class="font-bold text-md">Hardiness:</span>
		<!-- {seedPacket.instructions} -->
	</p>
	<p>
		<span class="font-bold text-md">Days to Harvest:</span>
		<!-- {seedPacket.daysToHarvest} -->
	</p>
	<p>
		<span class="font-bold text-md">Yield:</span>
		<!-- {seedPacket.yieldNotes} -->
	</p>
</div>
<div class="mt-4">
	<span class="font-bold text-xl">INSTRUCTIONS</span>
	<div>
		<span class="font-bold text-md">Sow:</span>
		<!-- {seedPacket.instructions.sowInstructions} -->
	</div>
	<div>
		<span class="font-bold text-md">Germination:</span>
		<!-- {seedPacket.instructions.germinationInstructions} -->
	</div>
	<div>
		<span class="font-bold text-md">Transplant:</span>
		<!-- {seedPacket.instructions.transplant	Instructions} -->
	</div>
</div>
