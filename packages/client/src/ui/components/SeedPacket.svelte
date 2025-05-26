<script lang="ts">
import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';





let hovered = $state(false)
let flipped = $state(false)
const controlY = new Tween(0, { duration: 500, easing: cubicOut })
const controlYUp = new Tween(0, { duration: 500, easing: cubicOut })

$effect(() => {
	controlY.set(hovered ? 40 : 0).catch((err: unknown) => {
		console.error('Error setting controlY', err)
	})
})
$effect(() => {
	controlYUp.set(hovered ? -40 : 0).catch((err: unknown) => {
		console.error('Error setting controlYUp', err)
	})
})

function toggleFlip() {
	flipped = !flipped
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="packet"
	class:flipped={flipped}
	onclick={toggleFlip}
	role="button"
	tabindex="0"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}>
	<div class="packet-inner">
		<div class="packet-front">
			<svg
				width="100%"
				height="100%"
				viewBox="0 -40 400 540"
				xmlns="http://www.w3.org/2000/svg"
				font-family="sans-serif"
				font-size="16">
				<defs>
					<linearGradient id="packetFrontGradient" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#fdfbf6" />
						<stop offset="100%" stop-color="#e2dccc" />
					</linearGradient>
					<defs>
						<linearGradient id="packetFrontGradient2" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stop-color="#fdfbf6" />
							<stop offset="100%" stop-color="#e2dccc" />
						</linearGradient>
						<linearGradient id="packetBackGradient" x1="1" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#fdfbf6" />
							<stop offset="100%" stop-color="#d8d3c1" />
						</linearGradient>
						<linearGradient id="flapGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#fdfbf6" stop-opacity="0.8" />
							<stop offset="100%" stop-color="#e2dccc" stop-opacity="0.2" />
						</linearGradient>
						<linearGradient id="flapFrontLipGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#ece6d8" />
							<stop offset="100%" stop-color="#c8c3b2" />
						</linearGradient>
						<radialGradient
							id="flapBackLipGradient"
							cx="50%"
							cy="100%"
							r="100%"
							fx="50%"
							fy="100%">
							<stop offset="0%" stop-color="#b3a98a" stop-opacity="0.4" />
							<stop offset="70%" stop-color="#b3a98a" stop-opacity="0.18" />
							<stop offset="100%" stop-color="#b3a98a" stop-opacity="0" />
						</radialGradient>
					</defs>
				</defs>
				<rect
					x="0"
					y="0"
					width="400"
					height="500"
					rx="13"
					ry="13"
					fill="url(#packetFrontGradient)"
					stroke="none"
					class="packet-front" />
				<!-- Draw the left, right, and bottom edges, including top corners, but skip the top edge -->
				<path
					d="M12,0
             A12,12 0 0 0 0,12
             L0,488
             A12,12 0 0 0 12,500
             L388,500
             A12,12 0 0 0 400,488
             L400,12
             A12,12 0 0 0 388,0"
					fill="none"
					stroke="#aaa"
					stroke-width="2" />
				<!-- Flap (front, curving out) -->
				<path
					d="M8,0 Q200,{controlY.current} 392,0"
					fill="url(#flapFrontLipGradient)"
					stroke="#aaa" />
				<!-- Flap (upward arch, bulges up on hover, inside shadow, closely overlapping) -->
				<path
					d="M8,0 Q200,{8 + controlYUp.current} 392,0"
					fill="url(#flapBackLipGradient)"
					stroke="#aaa"
					stroke-width="1"
					opacity="1" />

				<text
					x="200"
					y="120"
					font-size="40"
					font-weight="bold"
					text-anchor="middle"
					fill="#222"
					class="title"
					>SEEDS
				</text>
				<rect
					x="60"
					y="140"
					width="280"
					height="220"
					fill="none"
					stroke="#333"
					stroke-width="2" />
				<text x="200" y="250" font-size="18" text-anchor="middle" fill="#999"
					>(image)</text>
				<text x="200" y="340" font-size="20" text-anchor="middle" fill="#333"
					>SEED COUNT</text>
				<text x="30" y="470" font-size="16" fill="#444">Net Wt. 1g</text>
				<text x="370" y="470" font-size="16" text-anchor="end" fill="#444"
					>Product of Mexico</text>
			</svg>
		</div>
		<div class="packet-back">
			<svg
				width="100%"
				height="100%"
				viewBox="0 -40 400 540"
				xmlns="http://www.w3.org/2000/svg"
				font-family="sans-serif"
				font-size="16">
				<!-- Back Panel -->
				<rect
					x="0"
					y="0"
					width="400"
					height="500"
					rx="13"
					ry="13"
					fill="url(#packetBackGradient)"
					stroke="none" />
				<!-- Flap (front, curving out) -->
				<path
					d="M8,0 Q200,{controlY.current} 392,0"
					fill="url(#flapFrontLipGradient)"
					stroke="#aaa" />
				<!-- Flap (upward arch, bulges up on hover, inside shadow, closely overlapping) -->
				<path
					d="M8,0 Q200,{8 + controlYUp.current} 392,0"
					fill="url(#flapBackLipGradient)"
					stroke="#aaa"
					stroke-width="1"
					opacity="1" />
				<!-- Border path to match the front -->
				<path
					d="M13,0
             A13,13 0 0 0 0,13
             L0,487
             A13,13 0 0 0 13,500
             L387,500
             A13,13 0 0 0 400,487
             L400,13
             A13,13 0 0 0 387,0"
					fill="none"
					stroke="#aaa"
					stroke-width="2" />
				<text
					x="200"
					y="200"
					font-size="32"
					font-weight="bold"
					text-anchor="middle"
					fill="#222">INSTRUCTIONS</text>

				<g fill="#222" stroke="#333" stroke-width="1">
					<text x="40" y="250" font-size="20" font-weight="bold">Sow:</text>
					<line x1="130" y1="252" x2="360" y2="252" />

					<text x="40" y="290" font-size="20" font-weight="bold">Germination:</text>
					<line x1="180" y1="292" x2="360" y2="292" />

					<text x="40" y="330" font-size="20" font-weight="bold">Hardiness:</text>
					<line x1="150" y1="332" x2="360" y2="332" />

					<text x="40" y="370" font-size="20" font-weight="bold">Transplant (°F):</text>
					<line x1="200" y1="372" x2="360" y2="372" />

					<text x="40" y="410" font-size="20" font-weight="bold">Days to Harvest:</text>
					<line x1="210" y1="412" x2="360" y2="412" />

					<text x="40" y="450" font-size="20" font-weight="bold">Yield:</text>
					<line x1="110" y1="452" x2="360" y2="452" />
				</g>
			</svg>
		</div>
	</div>
</div>

<style lang="scss">
.packet {
	cursor: pointer;
	perspective: 1000px;
	max-width: 300px;
	aspect-ratio: 4 / 5;
	/* Or for responsiveness: max-width: 400px; width: 100%; aspect-ratio: 4 / 5; */
	.packet-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
		transform-style: preserve-3d;
	}
	&.flipped .packet-inner {
		transform: rotateY(180deg);
	}
	.packet-front,
	.packet-back {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		backface-visibility: hidden;
		border-radius: 12px;
	}
	.packet-back {
		transform: rotateY(180deg);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.title {
		pointer-events: none;
	}
}
svg {
	width: 100%;
	height: 100%;
	display: block;
}
</style>
