<script lang="ts">
	import { audioState } from '$lib/audioState.svelte';

	let audioEl = $state<HTMLAudioElement>();
	let isExpanded = $state(false);

	$effect(() => {
		if (audioEl) {
			audioState.setElement(audioEl);
		}
	});

	$effect(() => {
		if (audioState.currentTrack) {
			audioEl?.play().catch(() => {
				const enableAudio = () => {
					audioEl?.play();
					window.removeEventListener('click', enableAudio);
					window.removeEventListener('keydown', enableAudio);
				};
				window.addEventListener('click', enableAudio);
				window.addEventListener('keydown', enableAudio);
			});
		}
	});
</script>

{#if audioState.currentTrack}
	<audio
		bind:this={audioEl}
		src={audioState.currentTrack}
		bind:volume={audioState.volume}
		bind:muted={audioState.isMuted}
		loop
		hidden
	></audio>

	<div
		class="fixed z-50 flex items-center top-4 right-4 flex-col-reverse md:top-auto md:bottom-6 md:right-6 md:flex-col"
		onmouseenter={() => (isExpanded = true)}
		onmouseleave={() => (isExpanded = false)}
		role="region"
		aria-label="Audio Controls"
	>
		<!-- Vertical Volume Slider (Revealed on hover/click) -->
		<div
			class="overflow-hidden transition-all duration-300 flex flex-col items-center bg-neutral-900/90 backdrop-blur-md rounded-full shadow-lg border border-neutral-700 {isExpanded
				? 'mt-2 md:mt-0 md:mb-2 opacity-100 pointer-events-auto'
				: 'mt-0 mb-0 opacity-0 pointer-events-none'}"
			style="height: {isExpanded ? '10rem' : '0px'};"
		>
			<div class="h-full py-4 flex items-center justify-center w-10">
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={audioState.volume}
					oninput={(e) => audioState.setVolume(parseFloat(e.currentTarget.value))}
					class="rotated-range w-32 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
				/>
			</div>
		</div>

		<!-- Mute Toggle Button -->
		<button
			class="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 hover:bg-neutral-800 hover:border-orange-500/50 hover:text-orange-500 text-white transition-all cursor-pointer shadow-xl duration-300"
			onclick={() => {
				audioState.toggleMute();
				if (window.matchMedia('(hover: none)').matches) {
					isExpanded = !isExpanded;
				}
			}}
			aria-label={audioState.isMuted ? 'Unmute' : 'Mute'}
		>
			<span class="text-xl transform transition-transform" class:scale-0={audioState.isMuted}>
				{#if audioState.volume < 0.5}
					🔉
				{:else}
					🔊
				{/if}
			</span>
			<span
				class="text-xl absolute transform transition-transform"
				class:scale-0={!audioState.isMuted}>🔇</span
			>
		</button>
	</div>
{/if}

<style>
	/* Custom range styling for vertical feel */
	.rotated-range {
		transform: rotate(-90deg);
		transform-origin: center;
	}
</style>
