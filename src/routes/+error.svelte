<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || 'Access Denied');

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<div
	class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono"
>
	<!-- Background Effects -->
	<div
		class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,50,50,0.03)_1px,transparent_1px)] bg-size-[100%_4px] pointer-events-none z-0"
	></div>
	<div
		class="absolute inset-0 bg-radial-at-center from-orange-900/10 via-neutral-950/90 to-neutral-950 pointer-events-none z-0"
	></div>

	<!-- Main Content Container -->
	<div class="z-10 text-center max-w-2xl w-full relative pb-20 md:pb-0">
		<!-- Top Warning Badge -->
		<div class="mb-4 flex justify-center">
			<span
				class="px-4 py-1.5 bg-red-900/20 text-red-500 border border-red-500/30 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] animate-pulse uppercase backdrop-blur-sm"
			>
				⚠️ SYSTEM CRITICAL ERROR
			</span>
		</div>

		<!-- Error Code -->
		<h1 class="relative font-black leading-none select-none group mb-2">
			<span
				class="text-[120px] sm:text-[150px] md:text-[200px] text-transparent bg-clip-text bg-linear-to-b from-white to-neutral-800 drop-shadow-2xl"
			>
				{status}
			</span>
			<!-- Glitch Effects -->
			<span
				aria-hidden="true"
				class="absolute top-0 left-0 w-full text-[120px] sm:text-[150px] md:text-[200px] text-red-500/20 blur-sm translate-x-1 translate-y-1 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-100"
				>{status}</span
			>
			<span
				aria-hidden="true"
				class="absolute top-0 left-0 w-full text-[120px] sm:text-[150px] md:text-[200px] text-cyan-500/20 blur-sm -translate-x-1 -translate-y-1 -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-100"
				>{status}</span
			>
		</h1>

		<!-- Decorative Line -->
		<div
			class="w-24 h-1 bg-orange-600 mx-auto mb-6 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.6)]"
		></div>

		<!-- Error Message -->
		<h2
			class="text-xl md:text-2xl font-bold uppercase tracking-widest text-neutral-200 mb-6 max-w-lg mx-auto leading-relaxed"
		>
			<span class="bg-clip-text text-transparent bg-linear-to-r from-orange-200 to-orange-400">
				{message}
			</span>
		</h2>

		<!-- Description -->
		<p class="text-neutral-500 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed px-4">
			Neural link disconnected. The requested sector is currently unreachable or does not exist in
			this timeline.
		</p>

		<!-- Action Button -->
		<button
			onclick={() => goto('/')}
			class="group relative inline-flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold uppercase tracking-widest transition-all clip-path-polygon hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] cursor-pointer active:scale-95"
		>
			<span
				class="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"
			></span>
			<span class="relative z-10 flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-5 h-5"
					><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /></svg
				>
				REBOOT SYSTEM
			</span>
		</button>
	</div>

	<!-- Bottom Tech Info -->
	<div
		class="absolute bottom-6 left-0 w-full text-center text-[10px] text-neutral-700 font-mono tracking-widest opacity-50 hidden md:block"
	>
		ERROR_LOG_ID: {new Date().getTime().toString(16).toUpperCase()} // NODE_FAILURE
	</div>
</div>

<style>
	.clip-path-polygon {
		clip-path: polygon(
			10px 0,
			100% 0,
			100% calc(100% - 10px),
			calc(100% - 10px) 100%,
			0 100%,
			0 10px
		);
	}

	@keyframes scanline {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}
</style>
